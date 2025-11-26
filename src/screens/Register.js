import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { View, Text, Platform, ScrollView } from 'react-native';
import { Button, TextInput, useTheme, Card, Paragraph, Snackbar } from 'react-native-paper';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').required('Required'),
  username: Yup.string().min(3, 'Too Short!').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

export default function Register({ navigation }) {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const showMessage = (message) => {
    if (Platform.OS === 'web') {
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    } else {
      alert(message);
    }
  };

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      // Using JSONPlaceholder for demo - it accepts any data
      const res = await axios.post('https://jsonplaceholder.typicode.com/users', {
        name: values.username,
        email: values.email,
        password: values.password
      });
      
      // Simulate successful registration
      if (res.status === 201) {
        showMessage('✓ Account created successfully!');
        
        // Navigate to Login after 2 seconds
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      showMessage('✗ Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, paddingTop: 40 }}>
          <Card style={{ padding: 16, marginBottom: 20, backgroundColor: theme.colors.surfaceVariant }}>
            <Card.Content>
              <Paragraph>
                <Text style={{ fontWeight: 'bold' }}>Create your account{'\n'}</Text>
                Enter your email and password to register.
              </Paragraph>
            </Card.Content>
          </Card>

          <Formik 
            initialValues={{ name: '', username: '', email: '', password: '' }} 
            validationSchema={RegisterSchema} 
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <>
                <TextInput 
                  label="Full Name" 
                  mode="outlined" 
                  onChangeText={handleChange('name')} 
                  onBlur={handleBlur('name')} 
                  value={values.name} 
                  error={touched.name && errors.name}
                  autoCapitalize="words"
                />
                {touched.name && errors.name && (
                  <Text style={{ color: theme.colors.error, marginTop: 5, marginBottom: 10 }}>
                    {errors.name}
                  </Text>
                )}

                <TextInput 
                  label="Username" 
                  mode="outlined" 
                  onChangeText={handleChange('username')} 
                  onBlur={handleBlur('username')} 
                  value={values.username} 
                  error={touched.username && errors.username}
                  autoCapitalize="none"
                  style={{ marginTop: 10 }}
                />
                {touched.username && errors.username && (
                  <Text style={{ color: theme.colors.error, marginTop: 5, marginBottom: 10 }}>
                    {errors.username}
                  </Text>
                )}
                
                <TextInput 
                  label="Email" 
                  mode="outlined" 
                  onChangeText={handleChange('email')} 
                  onBlur={handleBlur('email')} 
                  value={values.email} 
                  error={touched.email && errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ marginTop: 10 }}
                />
                {touched.email && errors.email && (
                  <Text style={{ color: theme.colors.error, marginTop: 5, marginBottom: 10 }}>
                    {errors.email}
                  </Text>
                )}
                
                <TextInput 
                  label="Password" 
                  mode="outlined" 
                  secureTextEntry 
                  onChangeText={handleChange('password')} 
                  onBlur={handleBlur('password')} 
                  value={values.password} 
                  error={touched.password && errors.password} 
                  style={{ marginTop: 10 }} 
                />
                {touched.password && errors.password && (
                  <Text style={{ color: theme.colors.error, marginTop: 5 }}>
                    {errors.password}
                  </Text>
                )}
                
                <Button 
                  mode="contained" 
                  onPress={handleSubmit} 
                  loading={isSubmitting} 
                  disabled={isSubmitting}
                  style={{ marginTop: 20 }}
                >
                  Register
                </Button>
              </>
            )}
          </Formik>
          
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Login')} 
            style={{ marginTop: 10 }}
          >
            Already have an account? Login
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
}