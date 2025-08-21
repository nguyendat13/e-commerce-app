import { callApi, GET_IMG } from '@/helpers/services/apiService'; // nhớ import GET_IMG
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      setLoading(true);
      const res = await callApi(
        `public/products/keyword/${encodeURIComponent(searchText)}?pageNumber=0&pageSize=10&sortBy=productId&sortOrder=asc&categoryId=0`,
        "GET"
      );
      setResults(res.data.content || []); 
    } catch (err) {
      console.error("❌ Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image 
        source={{ uri: GET_IMG("products", item.image) }} 
        style={styles.productImage} 
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Ô search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && <Text style={{ marginTop: 20 }}>Đang tìm kiếm...</Text>}

      {/* Không tìm thấy */}
      {!loading && results.length === 0 && searchText.trim() !== "" && (
        <View style={styles.noResult}>
          <Image
            source={require('../../../assets/search-empty.png')}
            style={styles.image}
          />
          <Text style={styles.noResultText}>Không tìm thấy kết quả!</Text>
          <Text style={styles.suggestion}>
            Hãy thử từ khoá khác tổng quát hơn.
          </Text>
        </View>
      )}

      {/* Danh sách kết quả */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId.toString()}
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingVertical: 55,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
  },
  searchBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noResult: {
    marginTop: 80,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  noResultText: {
    fontSize: 18,
    fontWeight: '600',
  },
  suggestion: {
    marginTop: 6,
    color: '#666',
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  price: {
    color: 'green',
    marginTop: 4,
    fontWeight: "600",
  },
});
