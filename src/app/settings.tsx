import { memo, useState, useEffect, useCallback } from "react";
import { BottomNavigationBar } from "@/components/bottom-navigation-bar";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import { View, Text, ScrollView } from "react-native";
import { auth } from "@/firebase/config";
import { getUserById } from "@/firebase/firestore";
import { User } from "@/firebase/firestore";
import { useAuth } from "@/contexts/authContext";
import { TouchableRipple } from "react-native-paper";
import { IconPower } from "@tabler/icons-react-native";
import { useFocusEffect } from '@react-navigation/native';

const APP_VERSION = "1.0.0";

let userDataCache: User | null = null;

const ProfileHeader = memo(({ user }: { user: User | null }) => {
  const getInitials = () => {
    if (!user?.nome) return "?";
    
    const nameParts = user.nome.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: 20,
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: "100%",
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          backgroundColor: colors.green.base,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 35,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontFamily: fontFamily.bold,
            color: "#fff",
          }}
        >
          {getInitials()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamily.bold,
            color: "#000"
          }}
        >
          {user?.nome || "Carregando..."}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: fontFamily.regular,
            color: "#000",
            opacity: 0.7,
            marginTop: 4,
          }}
        >
          {user ? `RA: ${user.ra}` : ""}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: fontFamily.regular,
            color: "#000",
            opacity: 0.7,
          }}
        >
          {user ? `Turma: ${user.turma}` : ""}
        </Text>
      </View>
    </View>
  );
});

const SettingsSection = memo(({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={{
    width: "100%",
    marginBottom: 20,
  }}>
    <Text style={{
      fontSize: 16,
      fontFamily: fontFamily.semiBold,
      color: "#666",
      marginBottom: 10,
      paddingHorizontal: 10,
    }}>
      {title}
    </Text>
    <View style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      padding: 20,
    }}>
      {children}
    </View>
  </View>
));

const PointsInfo = memo(({ user }: { user: User | null }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ 
        fontSize: 28, 
        fontFamily: fontFamily.bold, 
        color: colors.green.base 
      }}>
        {user?.pontosAtuais || 0}
      </Text>
      <Text style={{ fontSize: 14, fontFamily: fontFamily.regular }}>
        Pontos Atuais
      </Text>
    </View>
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ 
        fontSize: 28, 
        fontFamily: fontFamily.bold, 
        color: colors.green.base 
      }}>
        {user?.pontosAdquiridos || 0}
      </Text>
      <Text style={{ fontSize: 14, fontFamily: fontFamily.regular }}>
        Pontos Adquiridos
      </Text>
    </View>
  </View>
));

export default function Settings() {
  const [user, setUser] = useState<User | null>(userDataCache);
  const [loading, setLoading] = useState(!userDataCache);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  const fetchUserData = useCallback(async () => {
    if (userDataCache) {
      setUser(userDataCache);
      setLoading(false);
      
      refreshUserDataInBackground();
      return;
    }
    
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setError("Usuário não autenticado");
        return;
      }
      
      const userData = await getUserById(currentUser.uid);
      userDataCache = userData;
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Falha ao carregar dados do usuário");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserDataInBackground = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const userData = await getUserById(currentUser.uid);
      userDataCache = userData;
      setUser(userData);
    } catch (err) {
      console.error("Background refresh failed:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleLogout = async () => {
    userDataCache = null;
    await logout();
  };

  return(
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.whiteShades[100],
        }}
      >
        <ScrollView 
          contentContainerStyle={{
            paddingTop: 100,
            paddingBottom: 80,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: fontFamily.bold,
              color: "#000",
              marginTop: 20,
              marginBottom: 20
            }}
          >
            Configurações
          </Text>

          <ProfileHeader user={user} />
          
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, fontFamily: fontFamily.regular }}>
              Carregando dados...
            </Text>
          ) : error ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: "red", fontFamily: fontFamily.regular }}>
              {error}
            </Text>
          ) : (
            <>
              <SettingsSection title="PONTUAÇÃO">
                <PointsInfo user={user} />
              </SettingsSection>
              
              <SettingsSection title="INFORMAÇÕES">
                <View>
                  <Text style={{ 
                    fontSize: 14, 
                    fontFamily: fontFamily.regular 
                  }}>
                    Versão do aplicativo: {APP_VERSION}
                  </Text>
                </View>
              </SettingsSection>
            </>
          )}

          <TouchableRipple
            onPress={handleLogout}
            style={{
              borderRadius: 16,
              overflow: "hidden",
            }}
            rippleColor={colors.whiteShades.transparent}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: fontFamily.semiBold,
                  color: colors.red.base,
                }}
              >
                Encerrar sessão
              </Text>
              <IconPower
                size={24}
                color={colors.red.base}
              />
            </View>
          </TouchableRipple>
        </ScrollView>
      </View>

      <TopNavigationBar />
      <BottomNavigationBar />
    </>
  );
}