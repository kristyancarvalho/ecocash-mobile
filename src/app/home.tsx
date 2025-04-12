import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import { Image, View, Text, DimensionValue, ActivityIndicator, StatusBar } from "react-native";
import { Surface } from "react-native-paper";
import { useState, useEffect } from "react";
import { getUserById, User } from "@/firebase/firestore";
import { auth } from "@/firebase/config";
import { BottomNavigationBar } from "@/components/bottom-navigation-bar";
import { TopNavigationBar } from "@/components/top-navigation-bar";

let userDataCache: User | null = null;

interface InfoItemTypes {
    title: string,
    content: string,
    width?: DimensionValue
}

const InfoItem = (InfoItemProps: InfoItemTypes) => {
    return (
        <View
            style={{
                backgroundColor: colors.whiteShades[100],
                width: InfoItemProps.width,
                borderRadius: 8,
                padding: 8,
                flex: InfoItemProps.width ? undefined : 1,
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
                {InfoItemProps.title}
            </Text>
            <Text
                style={{
                    fontSize: 16,
                    fontFamily: fontFamily.regular,
                    color: "#000"
                }}
            >
                {InfoItemProps.content}
            </Text>
        </View>
    )
}

export default function Home() {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const currentUser = auth.currentUser;
                
                if (!currentUser) {
                    setError("Usuário não autenticado");
                    setLoading(false);
                    return;
                }
                
                if (userDataCache) {
                    setUserData(userDataCache);
                    setLoading(false);
                    return;
                }
                
                const user = await getUserById(currentUser.uid);
                
                userDataCache = user;
                setUserData(user);
            } catch (err) {
                setError("Falha ao carregar dados do usuário");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const formatDate = (date: Date | string | any) => {
        if (!date) return "-";
        
        try {
            const dateObj = date.toDate ? date.toDate() : new Date(date);
            return dateObj.toLocaleDateString('pt-BR');
        } catch (err) {
            console.error("Erro ao formatar data:", err);
            return "-";
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={colors.green.base} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.whiteShades[200],
                    justifyContent: "center",
                    paddingHorizontal: 20
                }}
            >
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
                        <View style={{ padding: 20, alignItems: "center" }}>
                            <ActivityIndicator size="large" color={colors.green.base} />
                            <Text style={{ marginTop: 10, fontFamily: fontFamily.regular }}>
                                Carregando dados...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={{ padding: 20, alignItems: "center" }}>
                            <Text style={{ color: "red", fontFamily: fontFamily.regular }}>
                                {error}
                            </Text>
                        </View>
                    ) : userData ? (
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
                    ) : (
                        <Text style={{ padding: 20, textAlign: "center", fontFamily: fontFamily.regular }}>
                            Nenhum dado encontrado
                        </Text>
                    )}
                </Surface>
            </View>
            <TopNavigationBar />

            <BottomNavigationBar />
        </>
    )
}