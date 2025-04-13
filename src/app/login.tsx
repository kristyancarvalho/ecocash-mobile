import { fontFamily } from "@/styles/font-family"
import { colors } from "@/styles/theme"
import { View, Image, Text, ActivityIndicator, StatusBar } from "react-native"
import { CustomTextInput } from "../components/text-input"
import { CustomButton } from "../components/button"
import { useState, useEffect } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { getUserByRA } from "@/firebase/firestore"
import { auth } from "@/firebase/config"
import { router } from "expo-router"
import { FirebaseError } from "firebase/app"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from "@/contexts/authContext"

export default function Login() {
    const [ra, setRa] = useState("")
    const [password, setPassword] = useState("")
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { currentUser, isLoading } = useAuth()

    useEffect(() => {
        const checkLoginStatus = async () => {
            if (currentUser) {
                router.replace('/home')
            }
        }
        
        if (!isLoading) {
            checkLoginStatus()
        }
    }, [currentUser, isLoading])

    const handleLogin = async () => {
        if (!ra || !password) {
            setError("Por favor, preencha todos os campos")
            return
        }

        setLoading(true)
        setError("")

        try {
            const user = await getUserByRA(ra)
            
            if (!user) {
                setError("Usuário não encontrado")
                setLoading(false)
                return
            }
        
            const email = `${ra}@escola.com`
        
            await signInWithEmailAndPassword(auth, email, password)
            
            await AsyncStorage.setItem('userLoggedIn', 'true')
        
            router.replace("/home")
        } catch (error) {
            console.error("Erro no login:", error)
            
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case "auth/invalid-credential":
                    case "auth/invalid-email":
                    case "auth/user-not-found":
                    case "auth/wrong-password":
                        setError("RA ou senha incorretos")
                        break
                    case "auth/too-many-requests":
                        setError("Muitas tentativas de login. Tente novamente mais tarde")
                        break
                    default:
                        setError("Erro ao fazer login. Tente novamente.")
                }
            } else {
                setError("Erro ao fazer login. Tente novamente.")
            }
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.green.base} />
            </View>
        )
    }

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#Fff" />
            <View 
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#FFF",
                    paddingHorizontal: 20,
                    gap: 10
                }}
            >
                <Image
                    style={{width: 150, height: 100}}
                    source={require("../../assets/logo.png")} 
                />
                <Text
                    style={{
                        fontSize: 20,
                        fontFamily: fontFamily.medium,
                        marginBottom: 8
                    }}
                >
                    Que bom te ver novamente!
                </Text>

                {error ? (
                    <Text
                        style={{
                            fontFamily: fontFamily.regular,
                            fontSize: 14,
                            color: "red",
                            textAlign: "center",
                            marginVertical: 8
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                <View
                    style={{
                        width: "100%",
                        gap: 10
                    }}
                >
                    <CustomTextInput
                        label="RA"
                        placeholder="Digite seu RA"
                        value={ra}
                        onChangeText={setRa}
                        keyboardType="numeric"
                        disabled={loading}
                    />

                    <CustomTextInput
                        label="Senha"
                        placeholder="Digite sua senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={secureTextEntry}
                        disabled={loading}
                    />

                    <Text
                        style={{
                            fontFamily: fontFamily.regular,
                            fontSize: 14,
                            color: colors.green.base,
                            textAlign: "right",
                            marginTop: 4
                        }}
                        onPress={() => router.push("/")}
                    >
                        Esqueceu sua senha?
                    </Text>
                </View>

                <CustomButton 
                    title={loading ? "Entrando..." : "Entrar"}
                    onPress={handleLogin}
                    style={{ marginTop: 16 }}
                    disabled={loading}
                />
                
                {loading && (
                    <ActivityIndicator 
                        size="small" 
                        color={colors.green.base} 
                        style={{ marginTop: 10 }} 
                    />
                )}
            </View>
        </>
    )
}