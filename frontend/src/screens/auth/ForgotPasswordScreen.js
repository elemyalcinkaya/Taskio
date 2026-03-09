import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { authService } from '../../services/authService';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz.');
            return;
        }
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Hata', error.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Text style={styles.backText}>← Geri</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Şifremi Unuttum</Text>
                <Text style={styles.subtitle}>E-posta adresinize sıfırlama bağlantısı göndereceğiz.</Text>
                <TextInput
                    style={styles.input}
                    placeholder="E-posta adresi"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    <Text style={styles.buttonText}>Gönder</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
    back: { marginBottom: 32 },
    backText: { color: COLORS.primary, fontSize: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
    subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 32, lineHeight: 22 },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});

export default ForgotPasswordScreen;
