import { memo, useState, useCallback } from "react";
import { BottomNavigationBar } from "@/components/bottom-navigation-bar";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import { View, Text, Image, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User } from '@/firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';
import { IconSearch } from "@tabler/icons-react-native";
import { Button } from "react-native-paper";

interface FilterOption {
  label: string;
  value: string;
}

const Header = memo(() => (
  <View style={{
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 16,
  }}>
    <Image 
      style={{
        width: 80,
        height: 80,
      }}
      source={require("../../assets/icons/search.png")}  
    />
    <View>
      <Text style={{
        fontSize: 24,
        fontFamily: fontFamily.bold,
        color: "#000"
      }}>
        Consulta
      </Text>
      <Text style={{
        fontSize: 14,
        fontFamily: fontFamily.regular,
        color: "#000",
        opacity: 0.7,
        width: 200,
      }}>
        Descubra a pontuação dos seus amigos!
      </Text>
    </View>
  </View>
));

const LoadingState = memo(() => (
  <View style={{
    padding: 20,
    alignItems: "center",
  }}>
    <ActivityIndicator size="large" color={colors.green.base} />
    <Text style={{
      marginTop: 10,
      fontFamily: fontFamily.regular,
    }}>
      Carregando resultados...
    </Text>
  </View>
));

const ErrorState = memo(({ message }: { message: string }) => (
  <View style={{
    padding: 20,
    alignItems: "center",
  }}>
    <Text style={{
      color: "red",
      fontFamily: fontFamily.regular,
    }}>
      {message}
    </Text>
  </View>
));

export default function Search() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("nome");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterOptions: FilterOption[] = [
    { label: 'RA', value: 'ra' },
    { label: 'Nome', value: 'nome' },
    { label: 'Turma', value: 'turma' },
    { label: 'Pontos', value: 'pontosAtuais' }
  ];

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Falha ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => {
      const fieldValue = user[filterField as keyof User]?.toString().toLowerCase() || "";
      return fieldValue.includes(searchTerm.toLowerCase());
    });

    setFilteredUsers(filtered);
  };

  const UserRow = memo(({ user }: { user: User }) => (
    <View style={{
      flexDirection: "row",
      backgroundColor: "#FFF",
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginBottom: 10,
      borderRadius: 8,
      justifyContent: "space-between",
    }}>
      <Text style={{
        fontSize: 14,
        fontFamily: fontFamily.regular,
        color: "#000",
        flex: 0.8,
        marginRight: 10,
        textAlign: "left",
      }}>{user.ra}</Text>
      <Text style={{
        fontSize: 14,
        fontFamily: fontFamily.regular,
        color: "#000",
        flex: 1.2,
        marginRight: 10,
        textAlign: "left",
      }}>{user.nome}</Text>
      <Text style={{
        fontSize: 14,
        fontFamily: fontFamily.regular,
        color: "#000",
        flex: 0.8,
        marginRight: 10,
        textAlign: "left",
      }}>{user.turma}</Text>
      <Text style={{
        fontSize: 14,
        fontFamily: fontFamily.regular,
        color: "#000",
        flex: 0.6,
        textAlign: "left",
      }}>{user.pontosAtuais}</Text>
    </View>
  ));

  return (
    <>
      <View style={{
        flex: 1,
        backgroundColor: colors.whiteShades[100],
      }}>
        <ScrollView contentContainerStyle={{
          paddingTop: 100,
          paddingBottom: 80,
          paddingHorizontal: 20,
        }}>
          <Header />
          
          <View style={{
            flexDirection: "column",
            gap: 15,
            marginBottom: 30,
          }}>
            <View style={{
              height: 50,
            }}>
              <Dropdown
                style={{
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: "#FFF",
                  paddingHorizontal: 15,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  elevation: 2,
                }}
                placeholderStyle={{
                  color: "#888",
                  fontFamily: fontFamily.regular,
                }}
                selectedTextStyle={{
                  color: "#000",
                  fontFamily: fontFamily.regular,
                  fontSize: 16,
                }}
                data={filterOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Filtrar por"
                value={filterField}
                onChange={(item: FilterOption) => setFilterField(item.value)}
              />
            </View>
            
            <View style={{
              flexDirection: "row",
              height: 50,
              borderRadius: 15,
              overflow: "hidden",
            }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "#FFF",
                  paddingHorizontal: 15,
                  fontFamily: fontFamily.regular,
                  fontSize: 16,
                  borderTopLeftRadius: 15,
                  borderBottomLeftRadius: 15,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,
                  elevation: 2,
                }}
                placeholder="Pesquise aqui"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={handleSearch}
                selectionColor={colors.green.transparent}
              />
              <Button 
                style={{
                  backgroundColor: "#18DBB1",
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderTopRightRadius: 15,
                  borderBottomRightRadius: 15,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
                rippleColor={colors.whiteShades.transparent}
                onPress={handleSearch}
              >
                <IconSearch size={24} color="#FFF" />
              </Button>
            </View>
          </View>
          
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : filteredUsers.length === 0 ? (
            <Text style={{
              fontFamily: fontFamily.regular,
              textAlign: "center",
              marginTop: 20,
            }}>
              Nenhum usuário encontrado
            </Text>
          ) : (
            <View style={{
              width: "100%",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              <View style={{
                flexDirection: "row",
                backgroundColor: "#18DBB1",
                paddingVertical: 10,
                paddingHorizontal: 15,
                justifyContent: "space-between",
              }}>
                <Text style={{
                  fontSize: 16,
                  fontFamily: fontFamily.semiBold,
                  color: "#FFF",
                  flex: 1,
                  textAlign: "left",
                }}>RA</Text>
                <Text style={{
                  fontSize: 16,
                  fontFamily: fontFamily.semiBold,
                  color: "#FFF",
                  flex: 1,
                  textAlign: "left",
                }}>Nome</Text>
                <Text style={{
                  fontSize: 16,
                  fontFamily: fontFamily.semiBold,
                  color: "#FFF",
                  flex: 1,
                  textAlign: "left",
                }}>Turma</Text>
                <Text style={{
                  fontSize: 16,
                  fontFamily: fontFamily.semiBold,
                  color: "#FFF",
                  flex: 1,
                  textAlign: "left",
                }}>Pontos</Text>
              </View>
              
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <TopNavigationBar />
      <BottomNavigationBar />
    </>
  );
}