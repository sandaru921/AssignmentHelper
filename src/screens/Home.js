import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, FlatList, Text, StyleSheet, Dimensions, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useTheme, Searchbar, Chip, FAB, Snackbar, Card, Button, Divider, IconButton } from 'react-native-paper';
import { loadAssignments, toggleFavoriteAsync, toggleCompleteAsync } from '../store/assignmentsSlice';
import { searchBooks } from '../store/booksSlice';
import { saveFavorite } from '../store/favoritesSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Home({ navigation, isDarkMode, toggleTheme }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  const { items: assignments = [], loading } = useSelector(state => state.assignments);
  const { books = [], loading: booksLoading } = useSelector(state => state.books);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    dispatch(loadAssignments());
    // Fetch educational books from Open Library API
    dispatch(searchBooks('education programming science mathematics'));
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(loadAssignments());
    await dispatch(searchBooks('education programming science mathematics'));
    setRefreshing(false);
  };

  const getFilteredAssignments = () => {
    let filtered = [...(assignments || [])];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'Pending') {
      filtered = filtered.filter(a => !a.completed);
    } else if (filter === 'Completed') {
      filtered = filtered.filter(a => a.completed);
    }

    // Sort by deadline (earliest first)
    filtered.sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
      const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
      return dateA - dateB;
    });

    return filtered;
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (daysUntil) => {
    if (daysUntil === null) return theme.colors.onSurfaceVariant;
    if (daysUntil < 0) return theme.colors.error;
    if (daysUntil <= 3) return theme.colors.error;
    if (daysUntil <= 7) return '#FFA500';
    return theme.colors.primary;
  };

  const getStatusBadge = (assignment) => {
    if (assignment.completed) return { label: 'Completed', color: theme.colors.primary };
    
    const daysUntil = getDaysUntilDeadline(assignment.deadline);
    if (daysUntil === null) return { label: 'Active', color: theme.colors.primary };
    if (daysUntil < 0) return { label: 'Overdue', color: theme.colors.error };
    if (daysUntil === 0) return { label: 'Due Today', color: theme.colors.error };
    if (daysUntil <= 3) return { label: 'Urgent', color: theme.colors.error };
    if (daysUntil <= 7) return { label: 'Upcoming', color: '#FFA500' };
    return { label: 'Active', color: theme.colors.primary };
  };

  const getSubjectIcon = (subject) => {
    const subjectLower = subject?.toLowerCase() || '';
    if (subjectLower.includes('math')) return 'calculator';
    if (subjectLower.includes('science') || subjectLower.includes('physics') || subjectLower.includes('chemistry')) return 'flask';
    if (subjectLower.includes('english') || subjectLower.includes('literature')) return 'book-open-variant';
    if (subjectLower.includes('history')) return 'clock-time-four';
    if (subjectLower.includes('geography')) return 'earth';
    if (subjectLower.includes('art')) return 'palette';
    if (subjectLower.includes('music')) return 'music';
    if (subjectLower.includes('programming') || subjectLower.includes('computer')) return 'code-tags';
    return 'book-outline';
  };

  const getSubjectColor = (subject) => {
    const subjectLower = subject?.toLowerCase() || '';
    if (subjectLower.includes('math')) return '#FF6B6B';
    if (subjectLower.includes('science')) return '#4ECDC4';
    if (subjectLower.includes('english')) return '#95E1D3';
    if (subjectLower.includes('history')) return '#F38181';
    if (subjectLower.includes('programming')) return '#AA96DA';
    return theme.colors.primary;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const filteredAssignments = getFilteredAssignments();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Welcome Section */}
      <View style={styles.topBar}>
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: theme.colors.onSurfaceVariant }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
            {user?.name || user?.username || user?.email?.split('@')[0] || 'Student'} 👋
          </Text>
        </View>
        <MaterialCommunityIcons
          name={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
          size={28}
          color={theme.colors.primary}
          onPress={toggleTheme}
          style={styles.themeIcon}
        />
      </View>

      {/* Main Title */}
      <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
        My Assignments 📚
      </Text>
      <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {filteredAssignments.length} {filteredAssignments.length === 1 ? 'assignment' : 'assignments'}
      </Text>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search assignments..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
        iconColor={theme.colors.primary}
        elevation={0}
      />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Completed'].map(item => (
          <Chip
            key={item}
            selected={filter === item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterChip,
              filter === item && { backgroundColor: theme.colors.primaryContainer }
            ]}
            textStyle={{
              color: filter === item 
                ? theme.colors.onPrimaryContainer 
                : theme.colors.onSurfaceVariant
            }}
            mode={filter === item ? 'flat' : 'outlined'}
          >
            {item}
          </Chip>
        ))}
      </View>

      {/* Featured Educational Books Section */}
      <View style={styles.booksSection}>
        <View style={styles.booksSectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📖 Featured Educational Books
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            
          </Text>
        </View>
        
        {booksLoading ? (
          <Text style={{ color: theme.colors.onSurfaceVariant, padding: 16, textAlign: 'center' }}>
            Loading books...
          </Text>
        ) : books.length > 0 ? (
          <FlatList
            horizontal
            data={books.slice(0, 5)}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.bookCard, { backgroundColor: theme.colors.surface }]}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('BookDetails', { book: item });
                  }}
                  style={styles.bookCardTouchable}
                >
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
                  <Text style={[styles.bookTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.author_name && (
                    <Text style={[styles.bookAuthor, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                      {item.author_name[0]}
                    </Text>
                  )}
                </TouchableOpacity>
                <IconButton
                  icon="heart-plus"
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.favoriteButton}
                  onPress={() => {
                    dispatch(saveFavorite(item));
                    setSnackbarMessage(`✓ Added "${item.title}" to favorites!`);
                    setSnackbarVisible(true);
                  }}
                />
              </View>
            )}
            contentContainerStyle={styles.booksListContent}
          />
        ) : (
          <Text style={{ color: theme.colors.onSurfaceVariant, padding: 16, textAlign: 'center' }}>
            No books available
          </Text>
        )}
      </View>

      <Divider style={styles.divider} />

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginTop: 16 }]}>
        Your Assignments
      </Text>
    </View>
  );

  const renderAssignmentCard = ({ item }) => {
    const daysUntil = getDaysUntilDeadline(item.deadline);
    const deadlineColor = getDeadlineColor(daysUntil);
    const statusBadge = getStatusBadge(item);
    const subjectColor = getSubjectColor(item.subject);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('Details', { assignment: item })}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
          <Text style={styles.statusText}>{statusBadge.label}</Text>
        </View>

        {/* Subject Icon/Image */}
        <View style={[styles.iconContainer, { backgroundColor: subjectColor + '20' }]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.assignmentImage} />
          ) : (
            <MaterialCommunityIcons
              name={getSubjectIcon(item.subject)}
              size={32}
              color={subjectColor}
            />
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          {item.subject && (
            <Text style={[styles.cardSubject, { color: subjectColor }]}>
              {item.subject}
            </Text>
          )}

          {item.description && (
            <Text style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.deadlineContainer}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color={deadlineColor} />
              <Text style={[styles.deadlineText, { color: deadlineColor }]}>
                {formatDate(item.deadline)}
              </Text>
            </View>

            <View style={styles.cardIcons}>
              {item.favorite && (
                <MaterialCommunityIcons name="heart" size={20} color={theme.colors.error} />
              )}
              {item.completed && (
                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
              )}
            </View>
          </View>

          {daysUntil !== null && !item.completed && (
            <Text style={[styles.daysRemaining, { color: deadlineColor }]}>
              {daysUntil < 0 
                ? `Overdue by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}`
                : daysUntil === 0
                ? 'Due today!'
                : `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} left`
              }
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="calendar-check" size={80} color={theme.colors.onSurfaceVariant} />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No Assignments Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Tap the + button to create your first assignment
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredAssignments}
        renderItem={renderAssignmentCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tint={theme.colors.primary}
          />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddAssignment')}
        color={theme.colors.onPrimary}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  booksSection: {
    marginBottom: 8,
  },
  booksSectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  booksListContent: {
    paddingVertical: 8,
  },
  bookCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    position: 'relative',
  },
  bookCardTouchable: {
    flex: 1,
  },
  bookCover: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 11,
    marginBottom: 4,
  },
  favoriteButton: {
    margin: 0,
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardSubject: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  cardIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  daysRemaining: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
});