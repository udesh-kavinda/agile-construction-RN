import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import an icon library (e.g., MaterialIcons)
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import PendingListItem from '../components/PendingListItem'; // Adjust import path as needed
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

// Build URL with query parameters
const buildUrl = ({ status, progress }) => {
  const queryParams = new URLSearchParams({
    status,
    progress,
  }).toString();
  return `${API_BASE_URL}/api/employee/job/employee?${queryParams}`; // Replace with your local IP address
};

const PendingList = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [nextPage, setNextPage] = useState('');
  const [filter, setFilter] = useState({ status: 'ACTIVE', progress: 'ALL' });

  const { width } = useWindowDimensions();
  const { authState } = useAuth(); // Use authentication state

  const fetchPage = async (url) => {
    if (loading) return;

    console.log('Fetching: ', url);
    setLoading(true);

    try {
      const token = authState?.token; // Use token from authState
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseJson = await response.json();
      console.log('Response: ', responseJson.data.content);

      setItems((existingItems) => [...responseJson.data]);
      setNextPage(responseJson.info?.next || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    if (loading) return;
    setItems([]);
    setNextPage('');
    fetchPage(buildUrl({ ...filter }));
  };
  useEffect(() => {
    fetchPage(buildUrl(filter));
  }, []);

  useEffect(() => {
    fetchPage(buildUrl({ ...filter }));
  }, [filter]);

  const renderItem = useCallback(({ item }) => <PendingListItem Item={item} />, []);

  const itemHeight = width + 40;

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        minimumViewTime: 500,
        itemVisiblePercentThreshold: 50,
      },
      onViewableItemsChanged: ({ changed }) => {
        changed.forEach((changedItem) => {
          if (changedItem.isViewable) {
            console.log('++ Impression for: ', changedItem.item.id);
          }
        });
      },
    },
  ]);

  // Function to render a button
  const renderButton = (title, filterValue) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setFilter({ ...filter, progress: filterValue })}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  // Function to render "No Data" message
  const renderNoData = () => (
    <View style={styles.noDataContainer}>
      <Icon name="inbox" size={50} color="#cccccc" />
      <Text style={styles.noDataText}>No Data Available</Text>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {renderButton('All', 'ALL')}
        {renderButton('Done', 'DONE')}
        {renderButton('Pending', 'PENDING')}
        {renderButton('Processing', 'PROCESSING')}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : items.length === 0 ? (
        renderNoData()
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          onEndReached={() => {
            if (nextPage) fetchPage(nextPage);
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={() => loading && <ActivityIndicator />}
          refreshing={loading}
          onRefresh={onRefresh}
          initialNumToRender={3}
          getItemLayout={(data, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          numColumns={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  button: {
    flex: 1, // Makes all buttons the same width
    marginHorizontal: 5,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
  },
});

export default PendingList;
