import { Text, View } from 'react-native';
import { mockDashboardData } from '../../shared/utils/mock-data';
import BlogCard from '../../shared/components/ui/BlogCard';
import UserRankingList from '../users/UserRankingList';
import ActivityHistoryList from '../activity/screens/ActivityHistoryList';

export default function TabTwo() {
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Bienvenido al Dashboard</Text>
            <Text>Datos mockeados: {mockDashboardData.tabOne}</Text>
            {/*<ActivityHistoryList />*/}
            <UserRankingList />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                {/*<BlogCard />*/}
            </View>
        </View>
    );
}