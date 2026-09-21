import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { search_books } from '@/fetch/books';
import { Alert } from "react-native";
import { useBookResultStore } from '@/types/books';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const setScannedBook = useBookResultStore(s => s.setScannedBook)
  const isScanning = useRef(false);

  const index = () => {
    router.replace('/(tabs)')
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function searchEan13Books(event: BarcodeScanningResult) {
    if (isScanning.current) return;

    isScanning.current = true;

    try {
      const res = await search_books(event.data);

      if (!res || res.length === 0) {
        isScanning.current = false;
        Alert.alert(
          "Not Find Book",
          `Not book for ISBN ${event.data}.`,
          [
            {
              text: "OK",
              onPress: () => {
                isScanning.current = false;
              },
            },
          ]
        );
        router.push('/(tabs)');
        return;
      }

      setScannedBook(res[0]);
      console.log(
        "STORE APRES :",
        useBookResultStore.getState().scannedBook
      );
      router.push("/bookresult");
    } catch (error) {
      console.error(error);
      isScanning.current = false;
    }
  }


  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>

      <CameraView onBarcodeScanned={searchEan13Books} barcodeScannerSettings={{
        barcodeTypes: ["ean13"],
      }} style={styles.camera} facing={facing} />
      <View style={{
        position: 'absolute', top: 70, right: '35%', paddingHorizontal: 64, width: '100%'
      }}>
        <TouchableOpacity style={styles.button} onPress={index}>
          <Text style={styles.text}>Retour</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Changer de caméra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
