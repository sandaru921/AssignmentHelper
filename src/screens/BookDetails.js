import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useTheme, Button, Card, Chip, Divider, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { saveFavorite } from '../store/favoritesSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BookDetails({ route, navigation }) {
  const { book } = route.params;
  const theme = useTheme();
  const dispatch = useDispatch();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleAddToFavorites = () => {
    dispatch(saveFavorite(book));
    setSnackbarVisible(true);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Book Cover */}
      {book.cover_i ? (
        <Image
          source={{ uri: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` }}
          style={styles.coverImage}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="book-open-page-variant" size={100} color={theme.colors.onSurfaceVariant} />
        </View>
      )}

      {/* Book Title */}
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        {book.title}
      </Text>

      {/* Author */}
      {book.author_name && book.author_name.length > 0 && (
        <View style={styles.authorContainer}>
          <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
          <Text style={[styles.author, { color: theme.colors.onSurfaceVariant }]}>
            by {book.author_name.join(', ')}
          </Text>
        </View>
      )}

      {/* Metadata */}
      <View style={styles.metadataRow}>
        {book.first_publish_year && (
          <Chip icon="calendar" style={styles.chip}>
            {book.first_publish_year}
          </Chip>
        )}
        {book.number_of_pages_median && (
          <Chip icon="file-document" style={styles.chip}>
            {book.number_of_pages_median} pages
          </Chip>
        )}
        {book.language && book.language.length > 0 && (
          <Chip icon="translate" style={styles.chip}>
            {book.language[0].toUpperCase()}
          </Chip>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Publisher */}
      {book.publisher && book.publisher.length > 0 && (
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="office-building" size={24} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Publisher
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {book.publisher[0]}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Subjects */}
      {book.subject && book.subject.length > 0 && (
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Subjects
            </Text>
            <View style={styles.subjectsContainer}>
              {book.subject.slice(0, 10).map((subject, index) => (
                <Chip
                  key={index}
                  style={[styles.subjectChip, { backgroundColor: theme.colors.primaryContainer }]}
                  textStyle={{ fontSize: 12 }}
                  compact
                >
                  {subject}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* ISBN */}
      {book.isbn && book.isbn.length > 0 && (
        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="barcode" size={24} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  ISBN
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                  {book.isbn[0]}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Add to Favorites Button */}
      <Button
        mode="contained"
        onPress={handleAddToFavorites}
        icon="heart-plus"
        style={styles.favoriteButton}
      >
        Add to Favorites
      </Button>

      {/* Open Library Link */}
      <Text style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
        Data from Open Library
      </Text>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'View',
          onPress: () => {
            navigation.navigate('Main', { screen: 'Favorites' });
          },
        }}
      >
        ✓ Added to favorites!
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  coverImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  coverPlaceholder: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 36,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    fontSize: 16,
    marginLeft: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 20,
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  favoriteButton: {
    marginTop: 20,
    marginBottom: 16,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
