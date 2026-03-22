import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, SafeAreaView, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.');
            return;
        }
        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, password: form.password });
            Alert.alert('Başarılı', 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.', [
                { text: 'Tamam', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error) {
            Alert.alert('Kayıt Hatası', error.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Hesap Oluştur</Text>
                <Text style={styles.subtitle}>Taskio'ya katılın</Text>

                <View style={styles.form}>
                    {[
                        { key: 'name', placeholder: 'Ad Soyad' },
                        { key: 'email', placeholder: 'E-posta', keyboardType: 'email-address' },
                        { key: 'password', placeholder: 'Şifre', secure: true },
                        { key: 'confirmPassword', placeholder: 'Şifre Tekrar', secure: true },
                    ].map((field) => (
                        <TextInput
                            key={field.key}
                            style={styles.input}
                            placeholder={field.placeholder}
                            placeholderTextColor={COLORS.textMuted}
                            value={form[field.key]}
                            onChangeText={(val) => setForm({ ...form, [field.key]: val })}
                            secureTextEntry={field.secure}
                            keyboardType={field.keyboardType || 'default'}
                            autoCapitalize="none"
                        />
                    ))}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}>
                        {loading
                            ? <ActivityIndicator color={COLORS.white} />
                            : <Text style={styles.buttonText}>Kayıt Ol</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginText}>
                            Zaten hesabın var mı? <Text style={styles.loginLink}>Giriş Yap</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 32 },
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
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    loginText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 14 },
    loginLink: { color: COLORS.primary, fontWeight: 'bold' },
});

export default RegisterScreen;
