import ListItem from '../components/ListItem';
import {
  View,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';


const buildUrl = ({ status, progress, page, size }) => {
  const queryParams = new URLSearchParams({
    status,
    progress,
    page,
    size,
  }).toString();
  return `${API_BASE_URL}/api/employee/job?${queryParams}`; // Replace with your local IP address
};

import { Text } from 'react-native'; // Add this import

const MyList = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [nextPage, setNextPage] = useState('');
  
  const { width } = useWindowDimensions();
  const { authState } = useAuth(); // Use authentication state

  const fetchPage = async (url) => {
    if (loading) {
      return;
    }

    console.log('Fetching: ', url);
    setLoading(true);
    
    try {
      const token = authState?.token; // Use token from authState
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseJson = await response.json();
      console.log('Response: ', responseJson.data.content);

      setItems((existingItems) => [...existingItems, ...responseJson.data.content]);
      setNextPage(responseJson.info?.next || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    if (loading) {
      return;
    }
    setItems([]);
    setNextPage('');
    fetchPage(buildUrl({ status: 'ACTIVE', progress: 'NEW', page: 0, size: 50 }));
  };

  const handleItemAssigned = useCallback(() => {
    onRefresh();
  }, []);

  const renderItem = useCallback(
    ({ item }) => <ListItem Item={item} onAssign={handleItemAssigned} />,
    [handleItemAssigned]
  );

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

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  if (items.length === 0 && !loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
};

export default MyList;
