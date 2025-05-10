import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const images = [
    require('../assets/images/testing.png'),
    require('../assets/images/testing2.png'),
    require('../assets/images/testing3.png'),
];

export default function SideImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={images[currentIndex]} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: 'center', // 중앙 정렬
  },
  image: {
    width: '100%',
    height: '100%',
  },
});