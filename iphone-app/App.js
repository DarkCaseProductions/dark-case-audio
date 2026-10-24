import React, { useState } from "react";
import { SafeAreaView, View, Text, ScrollView, Pressable, StatusBar, Platform, Linking } from "react-native";
import { WebView } from "react-native-webview";

const SITE = "https://darkcaseaudio.com/";
const SECTIONS = [
  { title: "DCA Live Radio", subtitle: "Listen live, day and night", url: SITE, icon: "▶" },
  { title: "Audiobooks", subtitle: "Explore the latest audio releases", url: SITE + "#audiobooks", icon: "♫" },
  { title: "Ebooks", subtitle: "Browse digital books", url: SITE + "#ebooks", icon: "▤" },
  { title: "Free Crime Case Files", subtitle: "Explore the crime archive", url: SITE + "crime-case-files.html", icon: "⌕" },
  { title: "Free Paranormal Case Files", subtitle: "Hauntings, investigations and unexplained cases", url: SITE + "paranormal-case-files.html", icon: "☾" },
  { title: "Membership", subtitle: "Sign in and manage your account", url: SITE + "membership.html", icon: "♙" },
  { title: "Crime Forum", subtitle: "Discuss cases with the community", url: SITE + "crime-forum.html", icon: "◉" },
  { title: "Paranormal Forum", subtitle: "Share experiences and theories", url: SITE + "paranormal-forum.html", icon: "✧" },
];
export default function App() {
  const [page, setPage] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);
  const open = (item) => { setPage(item); setHistoryKey(v => v + 1); };
  const back = () => setPage(null);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#08090c", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor="#08090c" />
      <View style={{ height: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#292e37" }}>
        {page ? <Pressable onPress={back} style={{ paddingRight: 14, paddingVertical: 8 }}><Text style={{ color: "#ff3038", fontSize: 17, fontWeight: "800" }}>‹ BACK</Text></Pressable> : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 1 }}>DARK CASE <Text style={{ color: "#ff3038" }}>AUDIO</Text></Text>
          <Text style={{ color: "#aeb3bd", fontSize: 10, letterSpacing: 2 }}>TRUE CRIME • PARANORMAL • AUDIO</Text>
        </View>
        {page ? <Pressable onPress={() => Linking.openURL(page.url)}><Text style={{ color: "#c5c9d0", fontSize: 12 }}>OPEN WEB ↗</Text></Pressable> : null}
      </View>
      {page ? (
        <WebView key={historyKey} source={{ uri: page.url }} style={{ flex: 1, backgroundColor: "#08090c" }} javaScriptEnabled domStorageEnabled allowsBackForwardNavigationGestures mediaPlaybackRequiresUserAction={false} setSupportMultipleWindows={false} onShouldStartLoadWithRequest={(request) => { if (request.url.startsWith("https://darkcaseaudio.com") || request.url.startsWith("https://www.darkcaseaudio.com")) return true; if (request.url.startsWith("about:blank")) return true; Linking.openURL(request.url).catch(() => {}); return false; }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 34 }}>
          <View style={{ borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#343a46", marginBottom: 20, backgroundColor: "#08090c" }}>
            <View style={{ paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#151017", borderBottomWidth: 1, borderBottomColor: "#292e37" }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>📻 DARK CASE RADIO</Text>
              <Text style={{ color: "#aeb3bd", fontSize: 11, marginTop: 3 }}>LIVE 24/7 • True Crime & Paranormal</Text>
            </View>
            <WebView source={{ uri: SITE + "#free-audio" }} style={{ height: 390, backgroundColor: "#08090c" }} javaScriptEnabled domStorageEnabled allowsBackForwardNavigationGestures mediaPlaybackRequiresUserAction setSupportMultipleWindows={false} />
            <Pressable onPress={() => open(SECTIONS[0])} style={{ backgroundColor: "#d71920", padding: 13, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>OPEN FULL RADIO PAGE ↗</Text>
            </Pressable>
          </View>
          <View style={{ padding: 22, borderRadius: 18, borderWidth: 1, borderColor: "#493039", backgroundColor: "#151017", marginBottom: 22 }}>
            <Text style={{ color: "#ff3038", fontSize: 11, fontWeight: "900", letterSpacing: 3, marginBottom: 10 }}>DARK CASE PRODUCTIONS</Text>
            <Text style={{ color: "#fff", fontSize: 31, fontWeight: "900", lineHeight: 36 }}>Real cases.{ "\n" }Dark stories.</Text>
            <Text style={{ color: "#c5c9d0", fontSize: 14, lineHeight: 21, marginTop: 12 }}>Your home for true crime, paranormal investigations, audiobooks and Dark Case Radio — all in one place.</Text>
            <Pressable onPress={() => open(SECTIONS[0])} style={{ marginTop: 18, backgroundColor: "#d71920", padding: 14, borderRadius: 10, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>▶  LISTEN TO DCA LIVE RADIO</Text></Pressable>
          </View>
          <Text style={{ color: "#fff", fontSize: 21, fontWeight: "900", marginBottom: 12 }}>EXPLORE DARK CASE AUDIO</Text>
          {SECTIONS.map((item) => (
            <Pressable key={item.title} onPress={() => open(item)} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 10, borderRadius: 13, backgroundColor: pressed ? "#25212a" : "#14171d", borderWidth: 1, borderColor: "#292e37" })}>
              <View style={{ width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#321317", marginRight: 13 }}><Text style={{ color: "#ff3038", fontSize: 24, fontWeight: "800" }}>{item.icon}</Text></View>
              <View style={{ flex: 1 }}><Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{item.title}</Text><Text style={{ color: "#aeb3bd", fontSize: 12, marginTop: 4 }}>{item.subtitle}</Text></View>
              <Text style={{ color: "#ff3038", fontSize: 23 }}>›</Text>
            </Pressable>
          ))}
          <Text style={{ color: "#727985", textAlign: "center", fontSize: 11, marginTop: 18 }}>DARK CASE AUDIO • darkcaseaudio.com</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
