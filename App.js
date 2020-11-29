import React, { useState, useEffect } from "react";
import { Button, Image, View, Platform, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const [match, setMatch] = useState(null);
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        let { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }

        cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        status = cameraStatus.status;
        if (status !== "granted") {
          alert("Sorry, we need camera permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async (isCamera) => {
    let result;
    if (isCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    console.log(result);

    if (!result.cancelled) {
      const uri = result.uri;
      const uriParts = uri.split(".");
      let fileType = uriParts[uriParts.length - 1];
      let formData = new FormData();
      formData.append("photo", {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      let options = {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      };

      const fetchResult = await fetch(
        // "http://192.168.1.66:8080/api/upload",
        "http://localhost:8080/api/upload",
        options
      );
      const data = await fetchResult.json();
      console.log(data);
      setMatch(data.Similarity);
      setImage(result.uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title="Pick an image from camera roll"
        onPress={() => pickImage(false)}
      />
      <Button
        title="Pick an image from camera"
        onPress={() => pickImage(true)}
      />
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
      {match !== null && <Text>{`${match}% match !!`}</Text>}
    </View>
  );
}
