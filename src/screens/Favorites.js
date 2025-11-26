import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme, Card, IconButton, Chip, SegmentedButtons } from 'react-native-paper';
import { toggleFavoriteAsync, toggleCompleteAsync } from '../store/assignmentsSlice';
import { removeFavorite } from '../store/favoritesSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Favorites({ navigation, isDarkMode }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const assignments = useSelector(state => state.assignments.items);
  const favoriteBooks = useSelector(state => state.favorites.favorites || []);
  
  const [selectedTab, setSelectedTab] = useState('assignments');
  
  // Filter to show only favorite assignments
  const favoriteAssignments = assignments.filter(assignment => assignment.favorite);

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
      month: 'short',
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const renderAssignmentCard = ({ item }) => {
    const daysUntil = getDaysUntilDeadline(item.deadline);
    const deadlineColor = getDeadlineColor(daysUntil);
    const isOverdue = daysUntil < 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Details', { assignment: item })}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.subject && (
                  <Text style={[styles.subject, { color: theme.colors.onSurfaceVariant }]}>
                    {item.subject}
                  </Text>
                )}
              </View>
              
              <IconButton
                icon={item.favorite ? 'heart' : 'heart-outline'}
                iconColor={theme.colors.error}
                size={24}
                onPress={() => dispatch(toggleFavoriteAsync(item.id))}
              />
            </View>

            {item.description && (
              <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.deadlineContainer}>
                <MaterialCommunityIcons 
                  name={isOverdue ? 'alert-circle' : 'calendar-clock'} 
                  size={16} 
                  color={deadlineColor} 
                />
                <Text style={[styles.deadline, { color: deadlineColor }]}>
                  {formatDate(item.deadline)} • {isOverdue 
                    ? `${Math.abs(daysUntil)}d overdue`
                    : `${daysUntil}d left`
                  }
                </Text>
              </View>

              <Chip
                icon={item.completed ? 'check-circle' : 'clock-outline'}
                compact
                style={[
                  styles.statusChip,
                  { 
                    backgroundColor: item.completed 
                      ? theme.colors.primaryContainer 
                      : theme.colors.surfaceVariant 
                  }
                ]}
                onPress={() => dispatch(toggleCompleteAsync(item.id))}
              >
                {item.completed ? 'Done' : 'Pending'}
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderBookCard = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('BookDetails', { book: item })}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.bookCardContent}>
              {item.cover_i ? (
                <Image
                  source={{ uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` }}
                  style={styles.bookCover}
                />
              ) : (
                <View style={[styles.bookCoverPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="book" size={40} color={theme.colors.onSurfaceVariant} />
                </View>
              )}
              
              <View style={styles.bookInfo}>
                <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.author_name && item.author_name.length > 0 && (
                  <Text style={[styles.bookAuthor, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                    by {item.author_name[0]}
                  </Text>
                )}
                {item.first_publish_year && (
                  <Text style={[styles.bookYear, { color: theme.colors.onSurfaceVariant }]}>
                    Published: {item.first_publish_year}
                  </Text>
                )}
              </View>

              <IconButton
                icon="heart"
                iconColor={theme.colors.error}
                size={24}
                onPress={() => dispatch(removeFavorite(item.key))}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="heart" size={28} color={theme.colors.error} />
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            My Favorites
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {selectedTab === 'assignments' 
            ? `${favoriteAssignments.length} ${favoriteAssignments.length === 1 ? 'assignment' : 'assignments'}`
            : `${favoriteBooks.length} ${favoriteBooks.length === 1 ? 'book' : 'books'}`
          }
        </Text>

        {/* Tab Selector */}
        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          style={styles.segmentedButtons}
          buttons={[
            {
              value: 'assignments',
              label: 'Assignments',
              icon: 'clipboard-text',
            },
            {
              value: 'books',
              label: 'Books',
              icon: 'book',
            },
          ]}
        />
      </View>

      {selectedTab === 'assignments' ? (
        <FlatList
          data={favoriteAssignments}
          renderItem={renderAssignmentCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="clipboard-text-outline" 
                size={64} 
                color={theme.colors.onSurfaceVariant} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No favorite assignments yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                Tap the heart icon on any assignment to add it here
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={favoriteBooks}
          renderItem={renderBookCard}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="book-outline" 
                size={64} 
                color={theme.colors.onSurfaceVariant} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No favorite books yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                Browse books and add them to your favorites
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 40,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subject: {
    fontSize: 14,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusChip: {
    height: 28,
  },
  segmentedButtons: {
    marginTop: 16,
  },
  bookCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 12,
  },
  bookCoverPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
  },
  bookAuthor: {
    fontSize: 14,
    marginTop: 4,
  },
  bookYear: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});