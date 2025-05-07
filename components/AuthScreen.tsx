import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';
const AuthScreen: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { login, register } = useAuth();
    const clearForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        setError(null);
    }
    const handleAuthAction = async () => {
        if (isLoginMode) {
            if (!email || !password) {
                setError('Будь ласка, заповніть email та пароль.');
                return;
            }
        } else {
            if (!email || !password || !fullName || !phone) {
                setError('Будь ласка, заповніть всі поля.');
                return;
            }
        }
        setIsLoading(true);
        setError(null);
        try {
            if (isLoginMode) {
                await login(email, password);
                console.log('Login successful (from AuthScreen)');
            } else {
                await register(email, password, fullName, phone);
                Alert.alert('Успішна реєстрація', 'Акаунт створено. Тепер ви можете увійти.');
                setIsLoginMode(true);
                clearForm();
            }
        } catch (err: any) {
            console.error('Auth action failed (from AuthScreen):', err);
            setError(err.message || 'Сталася помилка. Спробуйте ще раз.');
        } finally {
            setIsLoading(false);
        }
    };
    const switchModeHandler = () => {
        setIsLoginMode(prevMode => !prevMode);
        clearForm();
    };
    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{isLoginMode ? 'Вхід' : 'Реєстрація'}</Text>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {!isLoginMode && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Повне ім'я"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                            textContentType="name"
                            editable={!isLoading}
                            placeholderTextColor={'#aaa'}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Телефон"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            textContentType="telephoneNumber"
                            editable={!isLoading}
                            placeholderTextColor={'#aaa'}
                        />
                    </>
                )}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    editable={!isLoading}
                    placeholderTextColor={'#aaa'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Пароль"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    textContentType={isLoginMode ? "password" : "newPassword"}
                    editable={!isLoading}
                    placeholderTextColor={'#aaa'}
                />
                {isLoading ? (
                    <ActivityIndicator size="large" color="#841584" style={styles.buttonSpacing} />
                ) : (
                    <View style={styles.buttonContainer}>
                         <Button variant='primary' onPress={handleAuthAction} disabled={isLoading}>
                         {isLoginMode ? 'Увійти' : 'Зареєструватися'}
                        </Button>
                    </View>
                )}
                <TouchableOpacity onPress={switchModeHandler} style={styles.switchButton} disabled={isLoading}>
                    <Text style={styles.switchText}>
                        {isLoginMode ? 'Немає акаунту? Зареєструватися' : 'Вже є акаунт? Увійти'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    buttonSpacing: {
        marginTop: 10,
        marginBottom: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchButton: {
        marginTop: 25,
    },
    switchText: {
        color: '#841584',
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#059669',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
export default AuthScreen;
