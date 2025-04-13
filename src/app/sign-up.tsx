import { useState } from "react"
import { View, Image, Text, ActivityIndicator, StatusBar, ScrollView } from "react-native"
import { CustomTextInput } from "../components/text-input"
import { CustomButton } from "../components/button"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/config"
import { createUser } from "@/firebase/firestore"
import { router } from "expo-router"
import { FirebaseError } from "firebase/app"
import { TouchableRipple } from "react-native-paper"
import { fontFamily } from "@/styles/font-family"
import { colors } from "@/styles/theme"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    ra: '',
    birthDate: '',
    classGroup: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (value: string) => {
    let formattedDate = value.replace(/\D/g, '');
    
    if (formattedDate.length > 8) {
      formattedDate = formattedDate.slice(0, 8);
    }
    
    if (formattedDate.length > 4) {
      formattedDate = `${formattedDate.slice(0, 2)}/${formattedDate.slice(2, 4)}/${formattedDate.slice(4)}`;
    } else if (formattedDate.length > 2) {
      formattedDate = `${formattedDate.slice(0, 2)}/${formattedDate.slice(2)}`;
    }
    
    setFormData(prev => ({
      ...prev,
      birthDate: formattedDate
    }));
  };

  const parseDateForFirebase = (dateString: string): string => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.ra.trim() || !/^\d+$/.test(formData.ra)) {
      setError('RA deve conter apenas números');
      return false;
    }
    
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(formData.birthDate)) {
      setError('Data de nascimento deve estar no formato DD/MM/AAAA');
      return false;
    }
    
    const [, day, month, year] = formData.birthDate.match(dateRegex) || [];
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Data de nascimento inválida');
      return false;
    }
    
    if (!formData.classGroup.trim()) {
      setError('Turma é obrigatória');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        `${formData.ra}@escola.com`, 
        formData.password
      );
      const user = userCredential.user;

      const birthDateForFirebase = parseDateForFirebase(formData.birthDate);

      await createUser(user.uid, {
        nome: formData.name,
        ra: formData.ra,
        dataNascimento: new Date(birthDateForFirebase + 'T00:00:00'),
        turma: formData.classGroup,
        pontosAtuais: 0,
        pontosAdquiridos: 0
      });

      router.replace('/home');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          setError('RA já cadastrado');
        } else if (error.code === 'auth/invalid-email') {
          setError('Formato de email inválido');
        } else if (error.code === 'auth/weak-password') {
          setError('Senha muito fraca');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#Fff" />
      <ScrollView 
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF",
          paddingHorizontal: 20,
          paddingVertical: 30
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
          Seja bem vindo!
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
            label="Nome"
            placeholder="Digite seu nome"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            disabled={loading}
          />

          <CustomTextInput
            label="RA"
            placeholder="Digite seu RA"
            value={formData.ra}
            onChangeText={(value) => handleChange('ra', value)}
            keyboardType="numeric"
            disabled={loading}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <CustomTextInput
                label="Data de Nascimento"
                placeholder="DD/MM/AAAA"
                value={formData.birthDate}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                disabled={loading}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomTextInput
                label="Turma"
                placeholder="Digite sua turma"
                value={formData.classGroup}
                onChangeText={(value) => handleChange('classGroup', value)}
                disabled={loading}
              />
            </View>
          </View>

          <CustomTextInput
            label="Senha"
            placeholder="Digite sua senha"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry={true}
            disabled={loading}
          />

          <CustomTextInput
            label="Confirmar Senha"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry={true}
            disabled={loading}
          />

          <CustomButton 
            title={loading ? "Cadastrando..." : "Cadastrar"}
            onPress={handleSubmit}
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

          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <TouchableRipple onPress={() => router.push("/login")}>
              <Text
                style={{
                  fontFamily: fontFamily.regular,
                  fontSize: 14,
                  color: colors.green.base,
                }}
              >
                Já tem uma conta? Faça login
              </Text>
            </TouchableRipple>
          </View>
        </View>
      </ScrollView>
    </>
  );
}