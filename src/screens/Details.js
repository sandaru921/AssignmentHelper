import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useTheme, Button, Chip, Card, IconButton, Divider, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavoriteAsync, toggleCompleteAsync, deleteAssignmentAsync } from '../store/assignmentsSlice';
import { searchBooks } from '../store/booksSlice';
import { saveFavorite } from '../store/favoritesSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Details({ route, navigation }) {
  const { assignment } = route.params;
  const dispatch = useDispatch();
  const theme = useTheme();
  const { books, loading } = useSelector(state => state.books);
  const { items: assignments } = useSelector(state => state.assignments);
  
  // Get fresh assignment data from store
  const currentAssignment = assignments.find(a => a.id === assignment.id) || assignment;
  
  const [showBooks, setShowBooks] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: 'Assignment Details',
      headerRight: () => (
        <IconButton
          icon="delete"
          iconColor={theme.colors.error}
          onPress={handleDelete}
        />
      ),
    });
  }, []);

  const handleDelete = () => {
    dispatch(deleteAssignmentAsync(currentAssignment.id));
    navigation.goBack();
  };

  const loadBookRecommendations = () => {
    const searchQuery = currentAssignment.subject || currentAssignment.title;
    dispatch(searchBooks(searchQuery));
    setShowBooks(true);
  };

  const getDaysUntilDeadline = () => {
    const today = new Date();
    const deadlineDate = new Date(currentAssignment.deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (daysUntil) => {
    if (daysUntil < 0) return theme.colors.error;
    if (daysUntil <= 3) return theme.colors.error;
    if (daysUntil <= 7) return '#FFA500';
    return theme.colors.primary;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric' 
    });
  };

  const daysUntil = getDaysUntilDeadline();
  const deadlineColor = getDeadlineColor(daysUntil);
  const isOverdue = daysUntil < 0;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Assignment Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {currentAssignment.title}
        </Text>
        
        <View style={styles.statusRow}>
          <Chip
            icon={currentAssignment.completed ? 'check-circle' : 'clock-outline'}
            style={[
              styles.statusChip,
              { backgroundColor: currentAssignment.completed ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
            ]}
          >
            {currentAssignment.completed ? 'Completed' : 'Pending'}
          </Chip>
          
          {currentAssignment.favorite && (
            <Chip
              icon="heart"
              style={[styles.statusChip, { backgroundColor: theme.colors.errorContainer }]}
            >
              Favorite
            </Chip>
          )}
        </View>
      </View>

      {/* Subject */}
      {currentAssignment.subject && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="book-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoText}>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Subject</Text>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>{currentAssignment.subject}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Deadline */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color={deadlineColor} />
            <View style={styles.infoText}>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Deadline</Text>
              <Text style={[styles.value, { color: deadlineColor }]}>
                {formatDate(currentAssignment.deadline)}
              </Text>
              <Text style={[styles.daysRemaining, { color: deadlineColor }]}>
                {isOverdue 
                  ? `Overdue by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}`
                  : `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} remaining`
                }
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Description */}
      {currentAssignment.description && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Description</Text>
            <Text style={[styles.description, { color: theme.colors.onSurface }]}>
              {currentAssignment.description}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode={currentAssignment.favorite ? 'contained' : 'outlined'}
          onPress={() => dispatch(toggleFavoriteAsync(currentAssignment.id))}
          icon={currentAssignment.favorite ? 'heart' : 'heart-outline'}
          style={styles.actionButton}
        >
          {currentAssignment.favorite ? 'Unfavorite' : 'Favorite'}
        </Button>

        <Button
          mode={currentAssignment.completed ? 'outlined' : 'contained'}
          onPress={() => dispatch(toggleCompleteAsync(currentAssignment.id))}
          icon={currentAssignment.completed ? 'undo' : 'check'}
          style={styles.actionButton}
        >
          {currentAssignment.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </Button>
      </View>

      <Divider style={styles.divider} />

      {/* Book Recommendations */}
      <View style={styles.booksSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Recommended Books
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          Find helpful resources for your assignment
        </Text>

        {!showBooks ? (
          <Button
            mode="contained"
            onPress={loadBookRecommendations}
            icon="book-search"
            style={styles.loadBooksButton}
            loading={loading}
          >
            Load Book Recommendations
          </Button>
        ) : (
          <FlatList
            data={books}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate('BookDetails', { book: item })}
                activeOpacity={0.7}
              >
                <Card style={[styles.bookCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content style={styles.bookContent}>
                    {item.cover_i && (
                      <Image
                        source={{ uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` }}
                        style={styles.bookCover}
                      />
                    )}
                    <View style={styles.bookInfo}>
                      <Text style={[styles.bookTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.author_name && (
                        <Text style={[styles.bookAuthor, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                          {item.author_name[0]}
                        </Text>
                      )}
                      <Button
                        mode="outlined"
                        compact
                        onPress={(e) => {
                          e.stopPropagation();
                          dispatch(saveFavorite(item));
                          setSnackbarMessage(`\u2713 Added "${item.title}" to favorites!`);
                          setSnackbarVisible(true);
                        }}
                        icon="heart-plus"
                        style={styles.addButton}
                      >
                        Add to Favorites
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            nestedScrollEnabled={true}
          />
        )}
      </View>

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
        {snackbarMessage}
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  card: {
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
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysRemaining: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 24,
  },
  booksSection: {
    marginTop: 8,
    flex: 1,  // Ensure it takes remaining space
  },
  loadBooksButton: {
    marginTop: 8,
  },
  bookCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  bookContent: {
    flexDirection: 'row',
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
});