import { useState, useCallback, memo } from "react";
import { BottomNavigationBar } from "@/components/bottom-navigation-bar";
import { CustomButton } from "@/components/button";
import { CustomTextInput } from "@/components/text-input";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import { View, Text, Image, Modal, Alert } from "react-native";
import { getUserById, updateUser } from "@/firebase/firestore";
import { auth } from "@/firebase/config";
import { useFocusEffect } from '@react-navigation/native';

let cachedUserPoints = {
    userId: '',
    points: 0,
    lastFetched: 0
};

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
            source={require("../../assets/icons/coin.png")}  
        />

        <View>
            <Text
                style={{
                    fontSize: 24,
                    fontFamily: fontFamily.bold,
                    color: "#000"
                }}
            >
                Carteira Virtual
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
                Troque seus pontos por incríveis recompensas!
            </Text>
        </View>
    </View>
));

const PointsDisplay = memo(({ userPoints, loading }: { userPoints: number, loading: boolean }) => (
    <>
        <View style={{
            width: "100%",
            alignItems: "center",
        }}>
            <Text
                style={{
                    fontSize: 18,
                    fontFamily: fontFamily.semiBold,
                    color: "#000",
                    textAlign: "center"
                }}
            >
                Obrigada pela sua contribuição!
            </Text>
            <Text
                style={{
                    fontSize: 16,
                    fontFamily: fontFamily.regular,
                    color: "#000",
                    marginTop: 18
                }}
            >
                Seu saldo atual:
            </Text>
        </View>
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10
            }}
        >
            <Image 
                source={require("../../assets/icons/coin-icon.png")}
                style={{width: 40, height: 40}}
            />
            <Text
                style={{
                    fontSize: 32,
                    fontFamily: fontFamily.bold,
                    color: "#000"
                }}
            >
                {loading ? "..." : userPoints}
            </Text>
        </View>
    </>
));

const RedemptionModal = memo(({ visible, onClose }: { visible: boolean, onClose: () => void }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
        <View 
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
        >
            <View 
                style={{
                    width: "85%",
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 25,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                }}
            >
                <Text
                    style={{
                        fontSize: 22,
                        fontFamily: fontFamily.semiBold,
                        color: "#000",
                        marginBottom: 20
                    }}
                >
                    Vale-Ponto
                </Text>
                
                <Image
                    source={require("../../assets/icons/qr-code.png")}
                    style={{
                        width: 124,
                        height: 124,
                        marginBottom: 20
                    }}
                />
                
                <Text
                    style={{
                        fontFamily: fontFamily.regular,
                        fontSize: 16,
                        textAlign: "center",
                        color: "#ACACAC",
                        marginBottom: 20
                    }}
                >
                    Agora, basta scanear e mostrar seu vale-ponto na cantina.
                    {"\n"}
                    O planeta agradece!
                </Text>
                
                <CustomButton
                    onPress={onClose}
                    title="Voltar"
                    style={{
                        width: "100%",
                        backgroundColor: colors.green.aqua
                    }}
                    rippleColor="rgba(255, 255, 255, 0.6)"
                />
            </View>
        </View>
    </Modal>
));

export default function Wallet() {
    const [points, setPoints] = useState("");
    const [redeemValue, setRedeemValue] = useState("0,00");
    const [modalVisible, setModalVisible] = useState(false);
    const [userPoints, setUserPoints] = useState(cachedUserPoints.points || 0);
    const [loading, setLoading] = useState(cachedUserPoints.points === 0);

    const fetchUserPoints = useCallback(async (forceRefresh = false) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const now = Date.now();
        const cacheValid = 
            cachedUserPoints.userId === currentUser.uid && 
            (now - cachedUserPoints.lastFetched) < 5 * 60 * 1000;

        if (!forceRefresh && cacheValid) {
            setUserPoints(cachedUserPoints.points);
            setLoading(false);
            return;
        }

        try {
            if (forceRefresh) {
                setLoading(true);
            }
            
            const userData = await getUserById(currentUser.uid);
            if (userData) {
                setUserPoints(userData.pontosAtuais);
                
                cachedUserPoints = {
                    userId: currentUser.uid,
                    points: userData.pontosAtuais,
                    lastFetched: now
                };
            }
        } catch (error) {
            console.error("Error fetching user points:", error);
            if (forceRefresh) {
                Alert.alert("Erro", "Não foi possível carregar seus pontos. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserPoints();
        }, [fetchUserPoints])
    );

    const handlePointsChange = useCallback((value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "");
        
        if (numericValue && parseInt(numericValue) > userPoints) {
            Alert.alert("Aviso", "Você não possui pontos suficientes.");
            setPoints(userPoints.toString());
            const calculatedValue = (userPoints / 10).toFixed(2).replace(".", ",");
            setRedeemValue(calculatedValue);
            return;
        }
        
        setPoints(numericValue);
        
        if (numericValue) {
            const calculatedValue = (parseInt(numericValue) / 10).toFixed(2).replace(".", ",");
            setRedeemValue(calculatedValue);
        } else {
            setRedeemValue("0,00");
        }
    }, [userPoints]);

    const handleRedeem = useCallback(async () => {
        try {
            const pointsToRedeem = parseInt(points);
            
            if (!pointsToRedeem || pointsToRedeem <= 0) {
                Alert.alert("Aviso", "Por favor, informe uma quantidade válida de pontos.");
                return;
            }
            
            if (pointsToRedeem > userPoints) {
                Alert.alert("Aviso", "Você não possui pontos suficientes.");
                return;
            }
            
            const currentUser = auth.currentUser;
            if (currentUser) {
                await updateUser(currentUser.uid, {
                    pontosAtuais: userPoints - pointsToRedeem
                });
                
                const newPoints = userPoints - pointsToRedeem;
                setUserPoints(newPoints);
                cachedUserPoints.points = newPoints;
                cachedUserPoints.lastFetched = Date.now();
                
                setModalVisible(true);
            }
        } catch (error) {
            console.error("Error redeeming points:", error);
            Alert.alert("Erro", "Não foi possível resgatar seus pontos. Tente novamente.");
        }
    }, [points, userPoints]);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setPoints("");
        setRedeemValue("0,00");
    }, []);

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

                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        padding: 20,
                        backgroundColor: "#FFF",
                        borderRadius: 8,
                        gap: 10
                    }}
                >
                    <PointsDisplay userPoints={userPoints} loading={loading} />

                    <Text
                        style={{
                            width: "100%",
                            textAlign: "center",
                            fontSize: 14,
                            fontFamily: fontFamily.regular,
                            color: "#000",
                        }}
                    >
                        Gostaria de trocar seus pontos?
                    </Text>

                    <View
                        style={{
                            width: "100%",
                            alignItems: "center",
                            gap: 10
                        }}
                    >
                        <CustomTextInput 
                            style={{width: "100%"}}
                            placeholder="Quantidade de pontos"
                            keyboardType="numeric"
                            value={points}
                            onChangeText={handlePointsChange}
                            editable={!loading}
                        />
                        <CustomTextInput 
                            style={{width: "100%"}}
                            disabled={true}
                            value={`R$ ${redeemValue}`}
                        />
                    </View>

                    <CustomButton 
                        onPress={handleRedeem} 
                        title="Resgatar" 
                        style={{width: "100%", backgroundColor: colors.green.aqua}} 
                        rippleColor="rgba(255, 255, 255, 0.6)"
                        disabled={loading || !points || parseInt(points) <= 0}
                    />
                </View>
            </View>

            <RedemptionModal visible={modalVisible} onClose={closeModal} />
            <TopNavigationBar />
            <BottomNavigationBar />
        </>
    );
}