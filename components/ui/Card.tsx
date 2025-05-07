import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type CardProps = React.ComponentProps<typeof View>

const Card: React.FC<CardProps> = ({ style, children, ...rest }) => {
    return (
        <View style={[styles.card, style]} {...rest}>
            {children}
        </View>
    )
}

const CardTitle: React.FC<React.ComponentProps<typeof Text>> = ({ style, children, ...rest }) => {
    return (
        <Text style={[styles.cardTitle, style]} {...rest}>
            {children}
        </Text>
    )
}

const CardSummary: React.FC<React.ComponentProps<typeof View>> = ({ style, children, ...rest }) => {
    return (
        <View style={[styles.summaryRow, style]} {...rest}>
            {children}
        </View>
    )
}
const CardSummaryLabel: React.FC<React.ComponentProps<typeof Text>> = ({ style, children, ...rest }) => {
    return (
        <Text style={[styles.summaryLabel, style]} {...rest}>
            {children}
        </Text>
    )
}
const CardSummaryValue: React.FC<React.ComponentProps<typeof Text>> = ({ style, children, ...rest }) => {
    return (
        <Text style={[styles.summaryValue, style]} {...rest}>
            {children}
        </Text>
    )
}
const Separator: React.FC<React.ComponentProps<typeof View>> = ({ style, ...rest }) => {
    return (
        <View style={[styles.separator, style]} {...rest} />
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb'
      },
    cardTitle:{
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#1f2937',
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
      },
      summaryLabel: {
        fontSize: 14,
        color: '#4b5563',
        maxWidth: '65%',
      },
      summaryValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
      },
      separator: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 10,
      },
}
)

export { Card, CardSummary, CardSummaryLabel, CardSummaryValue, CardTitle, Separator }

