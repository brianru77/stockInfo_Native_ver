import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SideImageSlider from '../../components/SideImageSlider';

const Gold_Silver_Constant = 31.1034768;
const POLL_INTERVAL_MS = 180_000;

export default function App() {
  type MarketResponse = {
    [key: string]: { price: string };
  };
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [goldOz, setGoldOz] = useState<number | null>(null);
  const [silverOz, setSilverOz] = useState<number | null>(null);
  const [usdKrw, setUsdKrw] = useState<number | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  let usdKrwEX, usdJpy, usdChf, jpyToKrw, chfToKrw;
  if (
    marketData &&
    marketData['USD/KRW'] &&
    marketData['USD/JPY'] &&
    marketData['USD/CHF']
  ) {
    usdKrwEX = parseFloat(marketData['USD/KRW'].price);
    usdJpy = parseFloat(marketData['USD/JPY'].price);
    usdChf = parseFloat(marketData['USD/CHF'].price);

    jpyToKrw = usdJpy ? usdKrwEX / usdJpy : null;
    chfToKrw = usdChf ? usdKrwEX / usdChf : null;
  }

  useEffect(() => {
    fetch('http://192.168.0.7:4000/market-data')
      .then(res => res.json())
      .then(data => {
        console.log('📈 실시간 데이터:', data);
        setMarketData(data);
      })
      .catch(error => {
        console.error('❌ 데이터 가져오기 실패:', error);
      });

    async function fetchPrices() {
      try {
        const resG = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
        if (!resG.ok) throw new Error('금/은 시세 API 오류');
        const dataG = await resG.json();
        const goldPrice = dataG?.items?.[0]?.xauPrice;
        const silverPrice = dataG?.items?.[0]?.xagPrice;
        if (typeof goldPrice !== 'number' || typeof silverPrice !== 'number') {
          throw new Error('금/은 데이터 오류');
        }
        setGoldOz(goldPrice);
        setSilverOz(silverPrice);

        const resF = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!resF.ok) throw new Error('환율 API 오류');
        const fx = await resF.json();
        const krwRate = fx?.rates?.KRW;
        if (typeof krwRate !== 'number') throw new Error('환율 데이터 오류');
        setUsdKrw(krwRate);

        const resBTC = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=krw');
        if (!resBTC.ok) throw new Error(`비트코인 API 오류: ${resBTC.status}`);
        const btc = await resBTC.json();
        const btcKrw = btc?.bitcoin?.krw;
        if (typeof btcKrw !== 'number') throw new Error('비트코인 데이터 오류');
        setBitcoinPrice(btcKrw);

        setError(null);
      } catch (e) {
        console.error('에러:', e);
        setError('데이터를 불러오는 중 문제가 발생했습니다.');
      }
    }

    fetchPrices();
    const timer = setInterval(fetchPrices, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  if (error)
    return (
      <SafeAreaView style={styles.error}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );

  if (goldOz == null || silverOz == null || usdKrw == null)
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  const goldPerGramUsd = goldOz / Gold_Silver_Constant;
  const goldPerGramKrw = goldPerGramUsd * usdKrw;
  const silverPerGramUsd = silverOz / Gold_Silver_Constant;
  const silverPerGramKrw = silverPerGramUsd * usdKrw;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff8f0' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <SideImageSlider />
        <Text style={styles.header}>📈 현금 흐름 지표 페이지</Text>

        <View style={styles.card}>
          <Text style={styles.title}>🏅 금</Text>
          <Text style={styles.price}>₩{Math.round(goldPerGramKrw).toLocaleString()} 원</Text>
          <Text style={styles.sub}>${goldPerGramUsd.toFixed(2)} /g</Text>

          <Text style={styles.title}>🥈 은</Text>
          <Text style={styles.price}>₩{Math.round(silverPerGramKrw).toLocaleString()} 원</Text>
          <Text style={styles.sub}>${silverPerGramUsd.toFixed(2)} /g</Text>
        </View>

        <Text style={styles.section}>₿ 실시간 비트코인 시세</Text>
        <Text style={styles.btc}>₩{bitcoinPrice?.toLocaleString()} 원 (1 BTC)</Text>

        <Text style={styles.section}>📊 실시간 시장 데이터</Text>
        {marketData ? (
          <View>
            <Text>💵 달러 인덱스: {marketData['DXY/USD']?.price}</Text>
            <Text>🛢️ WTI 유가: {marketData['WTI/USD']?.price}</Text>
            <Text>🇺🇸 USD/KRW: {marketData['USD/KRW']?.price}</Text>
            <Text>🇯🇵 JPY/KRW: {jpyToKrw ? jpyToKrw.toFixed(2) : '불러오는 중'}</Text>
            <Text>🇨🇭 CHF/KRW: {chfToKrw ? chfToKrw.toFixed(2) : '불러오는 중'}</Text>
          </View>
        ) : (
          <Text>데이터 불러오는 중...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff8f0' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff8f0' },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffe5e5' },
  errorText: { color: 'red', fontSize: 16 },
  header: { fontSize: 22, textAlign: 'center', marginBottom: 30 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 30,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  sub: { fontSize: 16, color: '#777' },
  section: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  btc: { fontSize: 22, color: '#d17b0f', fontWeight: 'bold', marginBottom: 10 },
});