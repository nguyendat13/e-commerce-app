import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const savedItems = [
  {
    id: '1',
    name: 'Áo thun Regular Fit',
    image: require('../../../assets/tshirt1.webp'),
    price: 1190000,
  },
  {
    id: '2',
    name: 'Áo Polo Regular Fit',
    image: require('../../../assets/tshirt1.webp'),
    price: 1190000,
  },
  {
    id: '3',
    name: 'Áo đen Regular Fit',
    image: require('../../../assets/tshirt1.webp'),
    price: 1190000,
  },
  {
    id: '4',
    name: 'Áo cổ tim Regular Fit',
    image: require('../../../assets/tshirt1.webp'),
    price: 1190000,
  },
];

const Saved = () => {
  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Image source={item.image} style={styles.image} />
      <TouchableOpacity style={styles.heartIcon}>
        <Ionicons name="heart" size={18} color="red" />
      </TouchableOpacity>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>
        {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
      </Text>
    </View>
  );
  const navigation =useNavigation<any>()

  return (
    <View style={styles.container}>
       <View style={styles.header}>
               <TouchableOpacity onPress={() => navigation.goBack()}>
                 <Ionicons name="arrow-back" size={30} />
               </TouchableOpacity>
               <Text style={styles.headerTitle}>Đã lưu</Text>
               <Ionicons name="notifications-outline" size={30} />
             </View>
      
      <FlatList
        data={savedItems}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default Saved;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical:25,

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical:25,
    paddingBottom: 50,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    margin: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
  },
  name: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
});
