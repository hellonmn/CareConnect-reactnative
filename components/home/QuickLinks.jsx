import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BloodTestTubeIcon from "../../assets/images/icons/blood-test-tube.svg";
import Calendar from "../../assets/images/icons/calendar.svg";
import ProcedureIcon from "../../assets/images/icons/procedures.svg";
import UserIcon from "../../assets/images/icons/user.svg";

export default function QuickLinks() {
  const router = useRouter();

  return (
    <View style={styles.quickLinksBox}>
      <TouchableOpacity
        style={styles.linkBox}
        onPress={() => router.push("/bookAppointment")}
      >
        <Calendar fill="#0694a2" width={26} height={26} />
        <Text style={styles.title}>Appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBox}>
        <BloodTestTubeIcon fill="#0694a2" width={26} height={26} />
        <Text style={styles.title}>Blood Banks</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBox}>
        <ProcedureIcon fill="#0694a2" width={26} height={26} />
        <Text style={styles.title}>Beds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBox}>
        <UserIcon fill="#0694a2" width={26} height={26} />
        <Text style={styles.title}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickLinksBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  linkBox: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#969595ff",
    fontSize: 13, },
});
