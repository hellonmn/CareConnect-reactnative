import { ScrollView, StyleSheet, View } from 'react-native';
import HomeHeader from "@/components/home/Header";
import SearchBar from "@/components/home/SearchBar";
import QuickLinks from "@/components/home/QuickLinks";
import Banner from "@/components/home/Banner";
import TopDoctors from "@/components/home/TopDoctors";
export default function HomeScreen() {

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} bounces={true}>
        <HomeHeader />
        <SearchBar />
        <QuickLinks />
        <Banner />
        <TopDoctors />
        {/*  <HealthArticles /> */}
        <View style={{ height: 150 }}></View>{/* Spacer for bottom nav */}
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 40
  },
  });

