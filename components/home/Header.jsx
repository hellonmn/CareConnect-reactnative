// app/home.js
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import BellIcon from "../../assets/images/icons/bell.svg";
import QrIcon from "../../assets/images/icons/qr.svg";

export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        Find your desire {"\n"}care solution
      </Text>
      <View style={styles.iconWrapper}>
        <View>
          <BellIcon width={20} height={26} />
        </View>
        <View style={styles.qrIconWrapper}>
          <QrIcon fill="#0694a2" width={20} height={26} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20
  },
  qrIconWrapper: {
    backgroundColor: "#d5f5f6",
    borderRadius: 15,
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    color: "#0694a2"
  },
});
