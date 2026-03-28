import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support.
          </Text>
          <Text style={styles.subTitle}>Personal Information:</Text>
          <Text style={styles.bulletPoint}>• Name and contact information</Text>
          <Text style={styles.bulletPoint}>• Email address and phone number</Text>
          <Text style={styles.bulletPoint}>• Payment information</Text>
          <Text style={styles.bulletPoint}>• Travel preferences and history</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
          <Text style={styles.bulletPoint}>• Send you technical notices and support messages</Text>
          <Text style={styles.bulletPoint}>• Communicate with you about products, services, and events</Text>
          <Text style={styles.bulletPoint}>• Monitor and analyze trends and usage</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
          </Text>
          <Text style={styles.bulletPoint}>• With accommodation providers to complete your bookings</Text>
          <Text style={styles.bulletPoint}>• With payment processors to handle transactions</Text>
          <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
          </Text>
          <Text style={styles.bulletPoint}>• Encryption of sensitive data</Text>
          <Text style={styles.bulletPoint}>• Secure data transmission protocols</Text>
          <Text style={styles.bulletPoint}>• Regular security assessments</Text>
          <Text style={styles.bulletPoint}>• Limited access to personal information</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights (GDPR Compliance)</Text>
          <Text style={styles.paragraph}>
            Under the General Data Protection Regulation (GDPR), you have the following rights:
          </Text>
          <Text style={styles.bulletPoint}>• Right to access your personal data</Text>
          <Text style={styles.bulletPoint}>• Right to rectify inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Right to erase your data (right to be forgotten)</Text>
          <Text style={styles.bulletPoint}>• Right to restrict processing</Text>
          <Text style={styles.bulletPoint}>• Right to data portability</Text>
          <Text style={styles.bulletPoint}>• Right to object to processing</Text>
          <Text style={styles.bulletPoint}>• Right to withdraw consent</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. We will delete or anonymize your data when it is no longer needed, unless we are required to retain it by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar tracking technologies to improve your experience, analyze usage, and provide personalized content. You can control cookie settings through your device preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Children&apos;s Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not intended for children under 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will take steps to delete it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          </Text>
          <Text style={styles.bulletPoint}>• Email: privacy@example.com</Text>
          <Text style={styles.bulletPoint}>• Phone: +1 (555) 123-4567</Text>
          <Text style={styles.bulletPoint}>• Address: 123 Privacy Street, Data City, DC 12345</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginLeft: 16,
    marginBottom: 8,
  },
});