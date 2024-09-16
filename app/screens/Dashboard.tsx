import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Import axios

const { width } = Dimensions.get('window');

const buildUrl = ({ status, progress }) => {
  const queryParams = new URLSearchParams({
    status,
    progress,
  }).toString();
  return `http://192.168.8.111:8080/api/employee/job/employee?${queryParams}`; // Replace with your local IP address
};

const Dashboard = () => {
  const { authState } = useAuth();
  const [jobStats, setJobStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        if (!authState || !authState.user) {
          throw new Error('User is not authenticated or authState is undefined');
        }
  
        const url = buildUrl({ status: 'ACTIVE', progress: 'ALL' });
        const response = await axios.get(url);
  
        if (response.data && Array.isArray(response.data.data)) {
          const jobs = response.data.data;
  
          // Initialize the counts for each progress type
          let pendingCount = 0;
          let processingCount = 0;
          let doneCount = 0;
  
          // Iterate through the job objects and count by `progress`
          jobs.forEach(job => {
            if (job.progress === 'PENDING') {
              pendingCount++;
            } else if (job.progress === 'PROCESSING') {
              processingCount++;
            } else if (job.progress === 'DONE') {
              doneCount++;
            }
          });
  
          // Set the state with the calculated counts
          setJobStats({
            pending: pendingCount,
            processing: processingCount,
            done: doneCount,
          });
        } else {
          throw new Error('Invalid data structure received from the server');
        }
  
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch job statistics');
        setLoading(false);
      }
    };
  
    fetchJobStats();
  }, [authState]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!authState?.user || !jobStats) {
    return <Text style={styles.errorText}>No data found</Text>;
  }

  const userDetails = authState.user;

  const chartData = [
    {
      name: 'New Jobs',
      population: jobStats.pending,
      color: '#007bff',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Pending Jobs',
      population: jobStats.processing,
      color: '#f39c12',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Done Jobs',
      population: jobStats.done,
      color: '#28a745',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: userDetails.image }} style={styles.profileImage} />
          <Text style={styles.name}>{userDetails.firstName} {userDetails.lastName}</Text>
          <Text style={styles.email}>{userDetails.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{userDetails.userRole}</Text>
          <Text style={styles.label}> | Designation:</Text>
          <Text style={styles.value}>{userDetails.designation || 'Not Provided'}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.label2}>Job Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{jobStats.pending}</Text>
            <Text style={styles.statLabel}>Pending Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{jobStats.processing}</Text>
            <Text style={styles.statLabel}>Processing Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{jobStats.done}</Text>
            <Text style={styles.statLabel}>Done Jobs</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainList')}>
          <Text style={styles.buttonText}>Get New Jobs +</Text>
        </TouchableOpacity>
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            accessor={'population'}
            backgroundColor={'transparent'}
            paddingLeft={'15'}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  card: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  profileHeader: {
    alignItems: 'center'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007bff',
    marginBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  label2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingBottom:10,
    paddingTop:-10,
    textAlign:'center',
    marginTop: -10,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 5,
    textAlign:'center'
  },
  chartContainer: {
    marginTop: -10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#dc3545',
  },
});

export default Dashboard;
