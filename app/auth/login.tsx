import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import {signInWithEmailAndPassword, sendPasswordResetEmail, } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';
import { auth } from '../../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const LogIn: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrorMsg('');
  };

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleSubmit = async () => {
    const { email, password } = formData;
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg('Invalid email address.');
      return;
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setErrorMsg('No internet connection. Please check your network.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await auth.signOut();
        Alert.alert('Email Not Verified', 'Please verify your email before logging in.');
        return;
      }

      router.replace('/Home');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.code === 'auth/wrong-password') {
        setErrorMsg('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Invalid email address.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMsg('Cannot connect to server. Check your internet connection.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMsg('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMsg('No user found with this email.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email first.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email.trim());
      setErrorMsg('');
      Alert.alert('Reset Email Sent', 'Please check your inbox.');
      setForgotMode(false);
      setFormData({ ...formData, password: '' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E6F2FF', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#E6F2FF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{forgotMode ? 'Reset Password' : 'Login'}</Text>

          <View style={styles.errorWrapper}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>

          {!forgotMode ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#8b8686"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#8b8686"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => handleChange('password', text)}
                />

                <TouchableOpacity
                  onPress={() => setForgotMode(true)}
                  style={{ alignSelf: 'flex-end', marginBottom: 10 }}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <LinearGradient
                colors={['#3B7CF5', '#5AD9D5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 25,
                  marginBottom: 40,
                }}
              >
                <Text style={styles.linkText}>If you don&apos;t have an account, please</Text>
                <Link href="/auth/signup" style={styles.link}>
                  Register.
                </Link>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#8b8686"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                />

                <LinearGradient
                  colors={['#3B7CF5', '#5AD9D5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Send Reset Email</Text>
                    )}
                  </TouchableOpacity>
                </LinearGradient>

                <TouchableOpacity onPress={() => setForgotMode(false)} style={{ marginTop: 15 }}>
                  <Text style={[styles.forgotText, { textAlign: 'center' }]}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 40 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3B7CF5',
    marginBottom: 15,
  },
  inputContainer: { marginBottom: 10 },
  label: { fontSize: 15, color: '#3B7CF5', fontWeight: '600', marginBottom: 6 },
  input: {
    height: 52,
    borderColor: 'rgba(59,124,245,0.5)',
    borderWidth: 1.2,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 15,
    shadowColor: '#3B7CF540',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  forgotText: {
    color: '#3B7CF5',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontStyle: 'italic',
  },
  buttonGradient: {
    borderRadius: 25,
    marginTop: 15,
    elevation: 5,
    shadowColor: '#3B7CF540',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  button: { paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  linkText: { fontSize: 16, color: '#444' },
  link: { fontWeight: 'bold', color: '#3B7CF5', fontSize: 16, marginLeft: 4 },
  errorWrapper: { minHeight: 22, marginBottom: 8 },
  errorText: { color: '#b91c1c', fontWeight: '600', textAlign: 'center' },
});


