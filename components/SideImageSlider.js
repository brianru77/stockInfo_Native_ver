import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const images = [
    require('../assets/images/gold.png'),
    require('../assets/images/silver.png'),
    require('../assets/images/bitcoin.png'),
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
    position: 'absolute', // fixed는 없고 absolute 사용
    top: '18%',
    right: 10,
    width: 200, // 모바일에 맞게 크기 조절
    height: 200,
    zIndex: 1000,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});