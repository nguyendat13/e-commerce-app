// app/screens/ChatAIScreen.tsx
import { GET_IMG, GET_PRODUCTS_BY_CATEGORY } from "@/helpers/services/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// 2️⃣ Định nghĩa RootStackParamList
type RootStackParamList = {
  Home: undefined;
  ProductDetail: { product: any }; // params cho route ProductDetail
};

// 3️⃣ Khai báo type cho navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 4️⃣ Sử dụng hook navigation
type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: any[];
};

export default function ChatAI() {
    const navigation = useNavigation<NavigationProp>(); // ✅ chỉ giữ ở đây

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "hello",
      role: "assistant",
      content:
        "Xin chào! Mình là ChatAI. Hỏi mình bất kỳ điều gì về sản phẩm, đơn hàng, hay thông tin kỹ thuật nhé.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<ChatMsg>>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMsg = {
      id: `${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let replyText = "";
      let products: any[] = [];

      // 👉 Nếu user hỏi sản phẩm
      if (userMsg.content.toLowerCase().includes("sản phẩm")) {
        const res = await GET_PRODUCTS_BY_CATEGORY(1, 0, 5);
        console.log("API trả về:", res.data); // Debug để chắc chắn

        products = res.data?.content || [];

        replyText =
          products.length > 0
            ? "Một số sản phẩm nổi bật:"
            : "Hiện chưa có sản phẩm nào.";
      } else {
        // 👉 Ngược lại thì gọi AI proxy
        const token = await AsyncStorage.getItem("jwt-token");
        const res = await fetch("http://10.196.85.41:3000/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            provider: "gemini",
            model: "gemini-2.0-flash",
          }),
        });

        const data = await res.json();
        replyText =
          data?.reply ||
          data?.content ||
          "Xin lỗi, hiện chưa nhận được phản hồi từ mô hình.";
      }

      const aiMsg: ChatMsg = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: replyText,
        products, // 👈 thêm sản phẩm nếu có
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "assistant",
          content: "Có lỗi khi gọi ChatAI.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
    }
  }, [input, loading, messages]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>

            {/* Nếu AI có trả về products thì render card sản phẩm */}
            {item.products &&
              item.products.map((p) => (
                <View key={p.productId} style={styles.productCard}>
                  <Image
                    source={{ uri: GET_IMG("products", p.image) }}
                    style={styles.productImage}
                  />
                  <Text style={styles.productName}>{p.productName}</Text>
                  <Text style={styles.productPrice}>
                    {p.specialPrice ?? p.price} VND
                  </Text>
                  <Button
                    title="Xem chi tiết"
                    onPress={() =>
                      navigation.navigate("ProductDetail", { product: p })
                    }
                  />
                </View>
              ))}
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && { opacity: 0.6 }]}
          onPress={sendMessage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.sendTxt}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F1F1",
  },
  bubbleText: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  inputBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    gap: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  sendTxt: { color: "#fff", fontWeight: "600" },

  // style card sản phẩm
  productCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  productName: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#e11d48",
    marginBottom: 8,
  },
});
