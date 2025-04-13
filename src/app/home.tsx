import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import { Image, View, Text, DimensionValue, ActivityIndicator, StatusBar, RefreshControl, ScrollView } from "react-native";
import { Surface } from "react-native-paper";
import { useState, useEffect, useCallback, memo } from "react";
import { getUserById, User } from "@/firebase/firestore";
import { auth } from "@/firebase/config";
import { BottomNavigationBar } from "@/components/bottom-navigation-bar";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { useFocusEffect } from '@react-navigation/native';

let userDataCache: User | null = null;

const InfoItem = memo(({ title, content, width }: {
    title: string,
    content: string,
    width?: DimensionValue
}) => {
    return (
        <View
            style={{
                backgroundColor: colors.whiteShades[100],
                width: width,
                borderRadius: 8,
                padding: 8,
                flex: width ? undefined : 1,
            }}
        >
            <Text
                style={{
                    fontSize: 12,
                    fontFamily: fontFamily.regular,
                    color: "#000",
                    opacity: 0.5,
                }}
            >
                {title}
            </Text>
            <Text
                style={{
                    fontSize: 16,
                    fontFamily: fontFamily.regular,
                    color: "#000"
                }}
            >
                {content}
            </Text>
        </View>
    );
});

const UserInfo = memo(({ userData }: { userData: User | null }) => {
    const formatDate = useCallback((date: Date | string | any) => {
        if (!date) return "-";
        
        try {
            const dateObj = date.toDate ? date.toDate() : new Date(date);
            return dateObj.toLocaleDateString('pt-BR');
        } catch (err) {
            console.error("Erro ao formatar data:", err);
            return "-";
        }
    }, []);

    if (!userData) {
        return (
            <Text style={{ padding: 20, textAlign: "center", fontFamily: fontFamily.regular }}>
                Nenhum dado encontrado
            </Text>
        );
    }

    return (
        <>
            <InfoItem title="RA" content={userData.ra || "-"} width="100%" />
            <InfoItem title="Nome" content={userData.nome || "-"} width="100%" />
            <View
                style={{
                    width: "100%",
                    flexDirection: "row",
                    gap: 10
                }}
            >
                <InfoItem 
                    title="Data de Nascimento" 
                    content={formatDate(userData.dataNascimento)} 
                    width="48%" 
                />
                <InfoItem title="Turma" content={userData.turma || "-"} width="48%" />
            </View>
            <View
                style={{
                    width: "100%",
                    flexDirection: "row",
                    gap: 10
                }}
            >
                <InfoItem 
                    title="Senha" 
                    content="******"
                    width="48%" 
                />
                <InfoItem 
                    title="Pontos Adquiridos" 
                    content={userData.pontosAdquiridos?.toString() || "0"} 
                    width="48%" 
                />
            </View>
        </>
    );
});

const LoadingState = memo(() => (
    <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.green.base} />
        <Text style={{ marginTop: 10, fontFamily: fontFamily.regular }}>
            Carregando dados...
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
            style={{width: 50, height: 100}}
            source={require("../../assets/icons/person.png")}  
        />

        <View>
            <Text
                style={{
                    fontSize: 24,
                    fontFamily: fontFamily.bold,
                    color: "#000"
                }}
            >
                Área do Usuário
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    fontFamily: fontFamily.regular,
                    color: "#000",
                    opacity: 0.7
                }}
            >
                Suas informações estão aqui!
            </Text>
        </View>
    </View>
));

export default function Home() {
    const [userData, setUserData] = useState<User | null>(userDataCache);
    const [loading, setLoading] = useState(!userDataCache);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserData = useCallback(async (forceRefresh = false) => {
        if (userDataCache && !forceRefresh) {
            setUserData(userDataCache);
            setLoading(false);
            return;
        }
        
        try {
            if (!refreshing) {
                setLoading(true);
            }
            
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                setError("Usuário não autenticado");
                return;
            }
            
            const user = await getUserById(currentUser.uid);
            userDataCache = user;
            setUserData(user);
            setError(null);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Falha ao carregar dados do usuário");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserData(true);
    }, [fetchUserData]);

    useFocusEffect(
        useCallback(() => {
            fetchUserData(false);
        }, [fetchUserData])
    );

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={colors.green.base} />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.green.base]}
                        tintColor={colors.green.base}
                        progressBackgroundColor="#ffffff"
                    />
                }
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.whiteShades[200],
                        justifyContent: "center",
                        paddingHorizontal: 20
                    }}
                >
                    <Header />

                    <Surface
                        elevation={1}
                        style={{
                            backgroundColor: "#FFF",
                            width: "100%",
                            borderRadius: 8,
                            paddingVertical: 20,
                            paddingHorizontal: 10,
                            gap: 10,
                            marginTop: 10
                        }}
                    >
                        {loading ? (
                            <LoadingState />
                        ) : error ? (
                            <ErrorState message={error} />
                        ) : (
                            <UserInfo userData={userData} />
                        )}
                    </Surface>
                </View>
            </ScrollView>
            <TopNavigationBar />
            <BottomNavigationBar />
        </>
    );
}