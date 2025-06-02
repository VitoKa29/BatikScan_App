import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Izin dibutuhkan untuk mengakses gambar!");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

    if (!result.canceled) {
      const fileType = result.assets[0].uri.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(fileType)) {
        Alert.alert("Format Tidak Didukung", "File harus JPG, JPEG, atau PNG.");
        return;
      }
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const classifyImage = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", {
      uri: image.uri,
      name: "image.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await axios.post(
        "http://18.214.158.188:8888/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengirim gambar.");
    } finally {
      setLoading(false);
    }
  };

  const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.customButton} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text
        style={[
          styles.title,
          { marginTop: image ? 20 : "90%" }
        ]}>
        BatikScan
      </Text>
      <Text style={styles.subtitle}>Klasifikasi Batik Nusantara</Text>

      <View style={styles.buttonRow}>
        <CustomButton
          title="📤 Upload Gambar"
          onPress={() => pickImage(false)}
        />
        <CustomButton title="📸 Ambil Foto" onPress={() => pickImage(true)} />
      </View>

      {image && (
        <>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <Text style={styles.previewText}>Preview Gambar</Text>
          <CustomButton title="🔍 Klasifikasikan" onPress={classifyImage} />
        </>
      )}

      {loading && (
        <View>
          <ActivityIndicator
            size="large"
            color="#B05E27"
            style={{ marginTop: 20 }}
          />
          <Text style={{ color: "#6E422A" }}>Mengklasifikasi Gambar...</Text>
        </View>
      )}

      {result && (
        <>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>✅ Hasil Klasifikasi:</Text>
            <Text style={styles.resultClass}>
              {result.predicted_class.replace(/_/g, " ")} (
              {result.confidence.toFixed(2)}%)
            </Text>
          </View>

          <View style={styles.probCard}>
            <Text style={styles.probHeader}>📊 Probabilitas Tiap Kelas:</Text>
            {Object.entries(result.probabilities).map(([label, value]) => (
              <View key={label} style={styles.probRow}>
                <Text style={styles.probLabel}>{label.replace(/_/g, " ")}</Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.probBar, { width: `${value}%` }]} />
                </View>
                <Text style={styles.probPercent}>{value.toFixed(2)}%</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5EBDD",
    flexGrow: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6E422A",
  },
  subtitle: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 20,
    color: "#B05E27",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  customButton: {
    backgroundColor: "#6E422A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B05E27",
  },
  previewText: {
    marginVertical: 10,
    fontStyle: "italic",
    color: "#6E422A",
  },
  resultCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#e6ffed",
    width: "100%",
    borderLeftWidth: 6,
    borderLeftColor: "#28a745",
  },
  resultLabel: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "bold",
    textAlign: "center",
  },
  resultClass: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  probCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  probHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  probRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  probLabel: {
    flex: 4,
    fontSize: 14,
    color: "#333",
  },
  barWrapper: {
    flex: 6,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 10,
    marginRight: -14,
  },
  probBar: {
    height: 10,
    backgroundColor: "#B05E27",
  },
  probPercent: {
    width: 60,
    fontSize: 12,
    color: "#333",
    textAlign: "right",
  },
});
