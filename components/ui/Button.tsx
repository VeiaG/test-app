import { accentColor, primaryColor } from '@/config/Colors'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

type ButtonProps = React.ComponentProps<typeof TouchableOpacity> & {
    variant?: 'primary'  | 'accent' | 'secondary' | 'ghost' | 'outline'
    children?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, style, ...rest }) => {
    const currentStyle = styles[variant]

    return (
        <TouchableOpacity style={[currentStyle.button, style]} {...rest}>
            <Text style={currentStyle.buttonText}>
                {children || 'Button'}
            </Text>
        </TouchableOpacity>
    )
}

const styles = {
    primary: StyleSheet.create({
        button: {
            backgroundColor: primaryColor,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
          },
          buttonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
          },
    }),
    accent: StyleSheet.create({
        button: {
            backgroundColor: accentColor,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
          },
          buttonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
          },
    }),
    secondary: StyleSheet.create({
        button: {
            backgroundColor: '#F6F6F6',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
          },
          buttonText: {
            color: '#555',
            fontSize: 16,
            fontWeight: '600',
          },
    }),
    outline: StyleSheet.create({
        button: {
            backgroundColor: 'transparent',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: primaryColor,
          },
          buttonText: {
            color: primaryColor,
            fontSize: 16,
            fontWeight: '600',
          },
    }),
    ghost: StyleSheet.create({
        button: {
            backgroundColor: 'transparent',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
            alignItems: 'center',
          },
          buttonText: {
            color: '#555',
            fontSize: 16,
            fontWeight: '600',
          },
    }),




}

export default Button