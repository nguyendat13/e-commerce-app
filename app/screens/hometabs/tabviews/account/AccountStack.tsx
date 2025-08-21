// stacks/AccountStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Account from '../../Account';
import AddressTab from './AddressTab';
import MyDetailsTab from './MyDetailsTab';
import MyOrdersTab from './MyOrdersTab';
import PaymentTab from './PaymentTab';


const Stack = createNativeStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={Account} />
       <Stack.Screen name="MyOrders" component={MyOrdersTab} />
      <Stack.Screen name="MyDetails" component={MyDetailsTab} />
      <Stack.Screen name="Address" component={AddressTab} />
      <Stack.Screen name="Payment" component={PaymentTab} />
    </Stack.Navigator>
  );
};

export default AccountStack;
