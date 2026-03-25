import useAuth from '@/shared/hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import CustomButton from '../../shared/components/ui/CustomButton';
const mainLogo = require('../../assets/logo-vibra.png');
const logoUnad = require('../../assets/sponsors/logo_unad.png');

export default function TabsLayout() {
    const tailwind = useTailwind();
    const { logout } = useAuth();
    const pathname = usePathname();

    const getTabStyle = (tabName: string) => {
        const isStart = pathname.includes(tabName);
        return {
            borderStartStartRadius: 10,
            borderStartEndRadius: 10,
            borderTopStartRadius: 10,
            borderTopLeftRadius: 10,
            marginTop: Platform.OS == 'ios' ? -4 : 0,
            paddingTop: Platform.OS == 'ios' ? -10 : 0,
            marginBottom: Platform.OS == 'ios' ? -10 : 0,
        };
    };

    const getTabTextStyle = (tabName: string) => {
        //console.log('pathname:', pathname);
        const isSelected = pathname.includes(tabName);
        return {
            color: isSelected ? '#0066CC' : '#666666',
            fontSize: 14,
        };
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style={Platform.OS == 'android' ? 'dark' : 'inverted'} />
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 6, top: 4 }}>
                <Image
                    source={mainLogo}
                    style={{ width: 100, height: 100, marginTop: Platform.OS == 'android' ? 0 : 16 }}
                />
                <Text style={[{ paddingLeft: 10, paddingTop: Platform.OS == 'ios' || Platform.OS == 'android' ? 25 : 0, top: 4 }, tailwind("text-6xl text-white")]}>
                    Vibra </Text>

                <Image
                    source={logoUnad}
                    style={{ width: 100, height: 56, marginTop: Platform.OS == 'android' ? 0 : -46 }}
                />
            </View>
            <Tabs screenOptions={{
                headerShown: false,
                tabBarPosition: 'top',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    width: '90%',
                    height: 64,
                    marginInline: 'auto',
                    borderTopStartRadius: 10,
                    borderTopEndRadius: 10,
                    marginTop: Platform.OS == 'ios' ? -4 : 0,
                    paddingTop: Platform.OS == 'ios' ? -10 : 0,
                    marginBottom: Platform.OS == 'ios' ? -10 : 0,
                },
                tabBarIconStyle: {
                    marginBottom: Platform.OS == 'ios' ? -2 : 0,
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    marginTop: 0
                },
                tabBarActiveTintColor: '#0066CC',
                tabBarInactiveTintColor: '#666666',
                tabBarActiveBackgroundColor: '#EAEAEA',
                headerStyle: {
                    backgroundColor: '#EAEAEA',
                    /*shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,*/
                    height: 80,
                    borderBottomColor: '#EAEAEA',
                },
                headerTitleStyle: {
                    fontSize: Platform.OS == "android" ? 30 : 18,
                    fontWeight: 'bold',
                    marginLeft: (() => {
                        if (Platform.OS === "android") return 30;
                        if (Platform.OS === "ios") return -30;
                        return 0;
                    })(),
                    marginTop: Platform.OS == "android" ? -36 : 0,
                },
                headerRight: () => (
                    <CustomButton title="Desconectar" variantColor="red" onPress={logout} />
                ),
            }}>
                <Tabs.Screen
                    name="one"
                    options={{
                        title: 'Eventos',
                        tabBarLabelStyle: getTabTextStyle('/features/one'),
                        tabBarItemStyle: {
                            borderTopStartRadius: 10,
                            //borderTopLeftRadius: 10,
                            //borderStartStartRadius: 10,
                        },
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="calendar-month" size={24} color={color} />
                        ),
                        /*headerLeft: () => (
                            <CustomButton title="Vibrar" onPress={logout} />
                        ),*/
                    }}
                />
                <Tabs.Screen
                    name="two"
                    options={{
                        title: 'Retos',
                        tabBarLabelStyle: getTabTextStyle('/components/two'),
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="power" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="three"
                    options={{
                        title: 'E-Personal',
                        tabBarLabelStyle: getTabTextStyle('/components/three'),
                        tabBarItemStyle: {
                            borderTopEndRadius: 10,
                        },
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="person" size={24} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </View >
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        top: 0,
        paddingHorizontal: 8,
        width: 120,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});