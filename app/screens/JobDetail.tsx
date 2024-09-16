import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Adding icons for visual appeal

const JobDetail = () => {
  const route = useRoute();
  const { jobId } = route.params as { jobId: string };
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'http://192.168.8.111:8080';

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employee/job/${jobId}`);
        setJob(response.data.data);
      } catch (err) {
        setError('Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleAssignToMe = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/employee/job/assign/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: 'pending' }));
    } catch (err) {
      setError('Failed to assign job');
    }
  };

  const handleStartJob = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/employee/job/start/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: 'processing' }));
    } catch (err) {
      setError('Failed to start the job');
    }
  };

  const handleCompleteJob = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/employee/job/done/${jobId}`);
      setJob((prevJob: any) => ({ ...prevJob, progress: 'done' }));
    } catch (err) {
      setError('Failed to complete the job');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!job) {
    return <Text style={styles.error}>No job details found</Text>;
  }

  // A function to render status as a badge
  const renderStatusBadge = (status: string) => {
    let statusColor = '#f0ad4e'; // default color for status
    if (status === 'done') statusColor = '#28a745';
    if (status === 'processing') statusColor = '#007bff';
    if (status === 'pending') statusColor = '#ffc107';
    if (status === 'new') statusColor = '#dc3545';

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  // Choose between door and window details
  const itemDetail = job.stockItem.door || job.stockItem.windows;

  if (!itemDetail) {
    return <Text style={styles.error}>No item details found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {itemDetail.image ? (
          <Image source={{ uri: itemDetail.image }} style={styles.image} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <Text style={styles.title}>{itemDetail.name}</Text>
        <Text style={styles.subtitle}>Code: {itemDetail.code}</Text>
        {renderStatusBadge(job.progress)}
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.row}>
          <Icon name="info" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Job Type:</Text>
        </View>
        <Text style={styles.detail}>{job.type}</Text>

        <View style={styles.row}>
          <Icon name="date-range" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Due Date:</Text>
        </View>
        <Text style={styles.detail}>{job.dueDate}</Text>

        <View style={styles.row}>
          <Icon name="inbox" size={20} color="#007bff" />
          <Text style={styles.detailLabel}>Quantity:</Text>
        </View>
        <Text style={styles.detail}>{job.qty}</Text>

        {itemDetail.price !== null && (
          <>
            <View style={styles.row}>
              <Icon name="attach-money" size={20} color="#007bff" />
              <Text style={styles.detailLabel}>Price:</Text>
            </View>
            <Text style={styles.detail}>${itemDetail.price}</Text>
          </>
        )}

        {/* Additional details based on the type */}
        {'door' in job.stockItem && (
          <>
            {itemDetail.doorColor && (
              <>
                <View style={styles.row}>
                  <Icon name="palette" size={20} color="#007bff" />
                  <Text style={styles.detailLabel}>Door Color:</Text>
                </View>
                <Text style={styles.detail}>{itemDetail.doorColor}</Text>
              </>
            )}

            {itemDetail.boardColor && (
              <>
                <View style={styles.row}>
                  <Icon name="palette" size={20} color="#007bff" />
                  <Text style={styles.detailLabel}>Board Color:</Text>
                </View>
                <Text style={styles.detail}>{itemDetail.boardColor}</Text>
              </>
            )}

            {itemDetail.fillingType && (
              <>
                <View style={styles.row}>
                  <Icon name="build" size={20} color="#007bff" />
                  <Text style={styles.detailLabel}>Filling Type:</Text>
                </View>
                <Text style={styles.detail}>{itemDetail.fillingType}</Text>
              </>
            )}
          </>
        )}

        {'windows' in job.stockItem && (
          <>
            {itemDetail.windowColor && (
              <>
                <View style={styles.row}>
                  <Icon name="palette" size={20} color="#007bff" />
                  <Text style={styles.detailLabel}>Window Color:</Text>
                </View>
                <Text style={styles.detail}>{itemDetail.windowColor}</Text>
              </>
            )}
          </>
        )}
      </View>

      {/* Job Progress Actions */}
      <View style={styles.actionContainer}>
        {job.progress === 'NEW' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleAssignToMe}>
            <Text style={styles.actionButtonText}>Assign To Me</Text>
          </TouchableOpacity>
        )}
        {job.progress === 'PENDING' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleStartJob}>
            <Text style={styles.actionButtonText}>Start the Job</Text>
          </TouchableOpacity>
        )}
        {job.progress === 'PROCESSING' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCompleteJob}>
            <Text style={styles.actionButtonText}>Complete the Job</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cccccc',
  },
  noImageText: {
    color: '#666666',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
  },
  detailsCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333333',
  },
  actionContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    color: '#ff0000',
  },
});

export default JobDetail;
