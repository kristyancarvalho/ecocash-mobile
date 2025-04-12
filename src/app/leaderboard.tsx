import { memo, useState, useCallback } from "react";
import { BottomNavigationBar } from "@/components/bottom-navigation-bar";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from '@/firebase/firestore';

let leaderboardCache: User[] | null = null;

const LoadingState = memo(() => (
  <View style={{ padding: 20, alignItems: "center" }}>
    <ActivityIndicator size="large" color={colors.green.base} />
    <Text style={{ marginTop: 10, fontFamily: fontFamily.regular }}>
      Carregando ranking...
    </Text>
  </View>
));

const ErrorState = memo(({ message }: { message: string }) => (
  <View style={{ padding: 20, alignItems: "center" }}>
    <Text style={{ color: "red", fontFamily: fontFamily.regular }}>
      {message}
    </Text>
  </View>
));

const Header = memo(() => (
  <View
    style={{
      alignItems: "center",
      flexDirection: "row",
      gap: 20,
      justifyContent: "center"
    }}
  >
    <Image 
      style={{width: 80, height: 80}}
      source={require("../../assets/icons/leaderboard.png")}  
    />

    <View>
      <Text
        style={{
          fontSize: 24,
          fontFamily: fontFamily.bold,
          color: "#000"
        }}
      >
        Ranking
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: fontFamily.regular,
          color: "#000",
          opacity: 0.7,
          width: 200,
        }}
      >
        Descubra as 7 melhores colocações!
      </Text>
    </View>
  </View>
));

const PodiumItem = memo(({ position, user, color }: { 
  position: 1 | 2 | 3, 
  user: User,
  color: string 
}) => {
  const iconSource = position === 1 
    ? require("../../assets/icons/first.png") 
    : position === 2
      ? require("../../assets/icons/second.png")
      : require("../../assets/icons/third.png");
      
  const coinSource = position === 1 
    ? require("../../assets/icons/coin-first.png") 
    : position === 2
      ? require("../../assets/icons/coin-second.png")
      : require("../../assets/icons/coin-third.png");

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        backgroundColor: color,
        padding: 10,
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8
      }}
    >
      <Image 
        style={{width: 40, height: 40}}
        source={iconSource}
      />

      <Text
        style={{
          fontSize: 16,
          fontFamily: fontFamily.semiBold,
          color: "#fff"
        }}
      >
        {user.nome}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: 8,
          borderRadius: 8,
          backgroundColor: "#fff"
        }}
      >
        <Image
          style={{
            width: 22,
            height: 20
          }}
          source={coinSource}
        />

        <Text
          style={{
            fontSize: 16,
            fontFamily: fontFamily.semiBold,
            color: color
          }}
        >
          {user.pontosAtuais}
        </Text>
      </View>
    </View>
  );
});

const Podium = memo(({ users }: { users: User[] }) => {
  if (users.length < 3) return null;
  
  return (
    <View
      style={{
        width: "100%",
        gap: 10
      }}
    >
      <PodiumItem position={1} user={users[0]} color={colors.podium.first} />
      <PodiumItem position={2} user={users[1]} color={colors.podium.second} />
      <PodiumItem position={3} user={users[2]} color={colors.podium.third} />
    </View>
  );
});

const OtherPlaceItem = memo(({ position, user }: { position: number, user: User }) => (
  <View
    style={{
      width: "100%",
      flexDirection: "row",
      backgroundColor: "#fff",
      paddingVertical: 10,
      paddingHorizontal: 26,
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 8
    }}
  >
    <Text
      style={{
        fontSize: 16,
        fontFamily: fontFamily.semiBold,
        color: "#000"
      }}
    >
      {position}
    </Text>
    <Text
      style={{
        fontSize: 16,
        fontFamily: fontFamily.semiBold,
        color: "#000",
        marginRight: 16
      }}
    >
      {user.nome}
    </Text>

    <Text
      style={{
        fontSize: 16,
        fontFamily: fontFamily.semiBold,
        color: "#000"
      }}
    >
      {user.pontosAtuais}
    </Text>
  </View>
));

const OtherPlaces = memo(({ users }: { users: User[] }) => {
  const remainingUsers = users.slice(3, 7);
  
  if (remainingUsers.length === 0) return null;
  
  return (
    <View
      style={{
        width: "100%",
        gap: 10
      }}
    >
      {remainingUsers.map((user, index) => (
        <OtherPlaceItem 
          key={user.id || index} 
          position={index + 4} 
          user={user} 
        />
      ))}
    </View>
  );
});

const fetchLeaderboardData = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('pontosAtuais', 'desc'),
      limit(8)
    );
    
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ 
        id: doc.id, 
        ...doc.data() 
      } as User);
    });
    
    return users;
  } catch (error) {
    console.error('Erro ao buscar dados do ranking:', error);
    throw error;
  }
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<User[]>(leaderboardCache || []);
  const [loading, setLoading] = useState(!leaderboardCache);
  const [error, setError] = useState<string | null>(null);
  
  const loadLeaderboardData = useCallback(async () => {
    if (leaderboardCache) {
      setLeaderboardData(leaderboardCache);
      setLoading(false);
      
      refreshLeaderboardInBackground();
      return;
    }
    
    try {
      setLoading(true);
      const users = await fetchLeaderboardData();
      leaderboardCache = users;
      setLeaderboardData(users);
    } catch (err) {
      setError("Falha ao carregar dados do ranking");
    } finally {
      setLoading(false);
    }
  }, []);
  
  const refreshLeaderboardInBackground = useCallback(async () => {
    try {
      const users = await fetchLeaderboardData();
      leaderboardCache = users;
      setLeaderboardData(users);
    } catch (err) {
      console.error("Background refresh failed:", err);
    }
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadLeaderboardData();
    }, [loadLeaderboardData])
  );
  
  return(
    <>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.whiteShades[100],
          paddingHorizontal: 20,
          gap: 20
        }}
      >
        <Header />
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : leaderboardData.length === 0 ? (
          <Text style={{ fontFamily: fontFamily.regular, textAlign: 'center' }}>
            Nenhum usuário encontrado no ranking
          </Text>
        ) : (
          <>
            <Podium users={leaderboardData} />
            <OtherPlaces users={leaderboardData} />
          </>
        )}
      </View>

      <TopNavigationBar />
      <BottomNavigationBar />
    </>
  );
}