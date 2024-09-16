import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
            flex: 1,
            padding: 16,
          },
          header: {
            alignItems: "center",
            marginBottom: 16,
          },
          image: {
            width: 100,
            height: 100,
            borderRadius: 8,
          },
          noImageContainer: {
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: "#ddd",
            justifyContent: "center",
            alignItems: "center",
          },
          noImageText: {
            color: "#888",
          },
          title: {
            fontSize: 18,
            fontWeight: "bold",
            marginVertical: 8,
          },
          subtitle: {
            fontSize: 16,
            color: "#666",
          },
          statusBadge: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 12,
            marginVertical: 8,
          },
          statusText: {
            color: "#fff",
            fontWeight: "bold",
          },
          detailsCard: {
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 1,
          },
          row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          },
          detailLabel: {
            fontSize: 16,
            fontWeight: "bold",
            marginLeft: 8,
          },
          detail: {
            fontSize: 16,
            color: "#333",
          },
          actionContainer: {
            marginTop: 16,
          },
          actionButton: {
            backgroundColor: "#007bff",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 8,
          },
          actionButtonText: {
            color: "#fff",
            fontWeight: "bold",
          },
          imagePreviewContainer: {
            marginVertical: 16,
            alignItems: "center",
          },
          imagePreview: {
            width: 100,
            height: 100,
            borderRadius: 8,
          },
          loading: {
            flex: 1,
            justifyContent: "center",
          },
          error: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            color: "red",
          },
});