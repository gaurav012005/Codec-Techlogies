import DashboardLayout from '../layouts/DashboardLayout';
import DashboardHome from '../components/dashboard/DashboardHome';

const DashboardPage = () => {
    return (
        <DashboardLayout title="Overview">
            <DashboardHome />
        </DashboardLayout>
    );
};

export default DashboardPage;
