import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabFeedbackScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E0E6FF', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#8f74e0"
          name="message"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Feedback</ThemedText>
      </ThemedView>
      <ThemedText>
        Share your feedback about campus events! Your comments and ratings help us improve your event experience.
      </ThemedText>

      {/* Place a feedback form or feedback listing component here.
          Example: <FeedbackForm /> or <FeedbackList /> */}
      <ThemedText style={{ marginTop: 18, color: '#8f74e0', fontWeight: 'bold' }}>
        (Feedback form or list integration goes here)
      </ThemedText>

      {/* Optional: Some helpful instructions or message */}
      <ThemedText style={{ marginTop: 28 }} type="subtitle">
        Your responses are anonymous and will be used to enhance future events.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#8f74e0',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
});
