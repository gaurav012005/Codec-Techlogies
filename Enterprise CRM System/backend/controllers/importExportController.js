const ImportLog = require('../models/ImportLog');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Deal = require('../models/Deal');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const MODEL_MAP = { Lead, Contact, Company, Deal };

// ─── Import CSV Data ─────────────────────────────────────
exports.importData = async (req, res, next) => {
    try {
        const { entity } = req.params;
        if (!MODEL_MAP[entity]) {
            return res.status(400).json({ success: false, message: `Invalid entity: ${entity}` });
        }

        const { records, columnMapping, skipDuplicates } = req.body;
        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: 'records array is required' });
        }

        if (records.length > 10000) {
            return res.status(400).json({ success: false, message: 'Maximum 10,000 records per import' });
        }

        // Create import log
        const importLog = await ImportLog.create({
            fileName: req.body.fileName || 'manual_import.csv',
            entity,
            totalRecords: records.length,
            status: 'processing',
            columnMapping: columnMapping || {},
            importedBy: req.user.id,
            organizationId: req.organizationId,
        });

        const Model = MODEL_MAP[entity];
        let successCount = 0;
        let failureCount = 0;
        let duplicateCount = 0;
        const errors = [];

        for (let i = 0; i < records.length; i++) {
            try {
                const record = { ...records[i], organizationId: req.organizationId };

                // Set owner for entities that require it
                if (!record.ownerId) record.ownerId = req.user.id;
                if (entity === 'Task' && !record.createdBy) record.createdBy = req.user.id;
                if (entity === 'Task' && !record.assignedTo) record.assignedTo = req.user.id;

                // Duplicate check
                if (skipDuplicates !== false) {
                    let dupFilter = { organizationId: req.organizationId };
                    if (record.email) dupFilter.email = record.email;
                    else if (record.name) dupFilter.name = record.name;

                    if (Object.keys(dupFilter).length > 1) {
                        const existing = await Model.findOne(dupFilter);
                        if (existing) {
                            duplicateCount++;
                            continue;
                        }
                    }
                }

                await Model.create(record);
                successCount++;
            } catch (err) {
                failureCount++;
                errors.push({
                    row: i + 1,
                    field: err.path || 'unknown',
                    message: err.message,
                    data: records[i],
                });
            }
        }

        // Update import log
        importLog.successCount = successCount;
        importLog.failureCount = failureCount;
        importLog.duplicateCount = duplicateCount;
        importLog.errors = errors.slice(0, 50); // Keep first 50 errors
        importLog.status = failureCount === records.length ? 'failed' : 'completed';
        importLog.completedAt = new Date();
        await importLog.save();

        await AuditLog.create({
            action: 'data_imported', entity, entityId: importLog._id,
            userId: req.user.id, organizationId: req.organizationId,
            description: `Imported ${successCount}/${records.length} ${entity} records`,
        });

        logger.info(`Import completed: ${successCount}/${records.length} ${entity} records`);
        res.json({
            success: true,
            data: {
                importId: importLog._id,
                totalRecords: records.length,
                successCount,
                failureCount,
                duplicateCount,
                errors: errors.slice(0, 10),
            },
        });
    } catch (error) { next(error); }
};

// ─── Export Data ─────────────────────────────────────
exports.exportData = async (req, res, next) => {
    try {
        const { entity } = req.params;
        if (!MODEL_MAP[entity]) {
            return res.status(400).json({ success: false, message: `Invalid entity: ${entity}` });
        }

        const { status, ownerId, startDate, endDate, format = 'json' } = req.query;
        const filter = { organizationId: req.organizationId };
        if (status) filter.status = status;
        if (ownerId) filter.ownerId = ownerId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const Model = MODEL_MAP[entity];
        const data = await Model.find(filter).lean().limit(10000);

        if (format === 'csv') {
            if (data.length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }
            const headers = Object.keys(data[0]).filter(k => k !== '__v');
            const csvRows = [headers.join(',')];
            data.forEach(row => {
                const values = headers.map(h => {
                    let val = row[h];
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'object') val = JSON.stringify(val);
                    return `"${String(val).replace(/"/g, '""')}"`;
                });
                csvRows.push(values.join(','));
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${entity}_export.csv"`);
            return res.send(csvRows.join('\n'));
        }

        res.json({ success: true, data, count: data.length });
    } catch (error) { next(error); }
};

// ─── Import History ─────────────────────────────────────
exports.getImportHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ImportLog.find({ organizationId: req.organizationId })
                .sort({ createdAt: -1 })
                .skip(skip).limit(parseInt(limit))
                .populate('importedBy', 'name email'),
            ImportLog.countDocuments({ organizationId: req.organizationId }),
        ]);

        res.json({
            success: true,
            data: { logs, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
        });
    } catch (error) { next(error); }
};

// ─── Import Preview ─────────────────────────────────────
exports.previewImport = async (req, res, next) => {
    try {
        const { records } = req.body;
        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'records array is required' });
        }

        const preview = records.slice(0, 5);
        const columns = records.length > 0 ? Object.keys(records[0]) : [];

        res.json({
            success: true,
            data: { preview, columns, totalRecords: records.length },
        });
    } catch (error) { next(error); }
};
