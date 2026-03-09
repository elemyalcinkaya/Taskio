import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi giriniz.');
            return;
        }
        setLoading(true);
        try {
            await login({ email, password });
        } catch (error) {
            Alert.alert('Giriş Hatası', error.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>Taskio</Text>
                <Text style={styles.subtitle}>Görevlerini yönet, ekibinle çalış.</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        placeholderTextColor={COLORS.textMuted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotText}>Şifremi Unuttum</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}>
                        {loading
                            ? <ActivityIndicator color={COLORS.white} />
                            : <Text style={styles.loginButtonText}>Giriş Yap</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerText}>
                            Hesabın yok mu? <Text style={styles.registerLink}>Kayıt Ol</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    logo: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 40 },
    form: { gap: 16 },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    forgotText: { color: COLORS.primary, textAlign: 'right', fontSize: 14 },
    loginButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    registerText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 14 },
    registerLink: { color: COLORS.primary, fontWeight: 'bold' },
});

export default LoginScreen;
