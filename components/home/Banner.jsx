                      import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Banner() {
  return (
    <View style={styles.bannerBox}>
        <ImageBackground
        source={require('../../assets/images/cover-bg.png')} // adjust the path if needed
        style={styles.container}
        imageStyle={styles.image} // optional, if you need rounded corners on the image
        >
        <View style={styles.content}>
            <Text style={styles.title}>
            Early protection for your family health
            </Text>
            <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Learn more</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.rightSpace}></View>
        </ImageBackground>

    </View>
  );
}

const styles = StyleSheet.create({
  bannerBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 16, // rounded-xl ~ 16px
    overflow: 'hidden', // ensure borderRadius clips the image
    width: '100%',
    height: 144, // h-36 -> 36 * 4 = 144px
  },
  image: {
    resizeMode: 'cover', // background-size: cover
  },
  content: {
    flex: 1,
    padding: 16, // p-4 ~ 16px
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20, // text-lg ~ 18px
    fontWeight: '600', // font-semibold
    color: '#3b4048e8', // text-gray-700
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#0d9488', // bg-teal-600
    borderRadius: 9999, // rounded-full
    paddingVertical: 4, // py-1 -> 4px
    paddingHorizontal: 16, // px-4 -> 16px
  },
  buttonText: {
    color: 'white',
    fontSize: 14, // text-sm
  },
  rightSpace: {
    width: 80, // w-20 -> 20*4=80px
    height: '100%',
  },
});
