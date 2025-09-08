// app/home.js
import React from 'react';
import {
  StyleSheet,
  TextInput,
  Vibration,
  View
} from "react-native";
import SearchIcon from "../../assets/images/icons/search.svg";

export default function SearchBar() {
  const [text, setText] = React.useState('');

  const handleKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Backspace' && text.length === 0) {
      // Vibrate for 50ms
      Vibration.vibrate([0, 100, 50, 100]);
    }
  };

  return (
    <View style={styles.searchBox}>
      <SearchIcon style={styles.searchIcon} fill="#aeaeaeff" width={20} height={26} />
      <TextInput
        placeholder="Search doctors, drugs, articles..."
        style={styles.input}
        onChangeText={setText}
        placeholderTextColor="#aeaeaeff"
        value={text}
        onKeyPress={handleKeyPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    position: "relative"
  },
  input: {
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,                                                                                                                                                                                                                               
    paddingLeft: 45,
    borderRadius: 50,
    borderColor: "#f6f6f6ff",
    backgroundColor: "#fefefeff",
    color: "#000000ff",
    placeholderTextColor: "#000"
  },
  searchIcon: {
    position: "absolute",
    top: 25,
    left: 25,
    zIndex: 1,
  },
});
