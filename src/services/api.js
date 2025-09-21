// API service for Netlify functions
const API_BASE = '/.netlify/functions'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`

    // Correctly merge headers and prevent silent overwrites
    const { headers, ...restOfOptions } = options;
    const config = {
      ...restOfOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Handle PDF responses
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        return response.blob()
      }
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Seed users on first app load
  async seedUsers() {
    return this.request('/seed-users', {
      method: 'POST'
    })
  }

  // Create a new patient
  async createPatient(patientData, registeredBy) {
    return this.request('/create-patient', {
      method: 'POST',
      body: JSON.stringify({
        ...patientData,
        registeredBy
      })
    })
  }

  // Process billing
  async processBilling(patientId, items, paymentMethod, amountPaid, processedBy) {
    return this.request('/process-billing', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        items,
        paymentMethod,
        amountPaid,
        processedBy
      })
    })
  }

  // Add medical record
  async addMedicalRecord(patientId, recordType, data, authorId) {
    return this.request('/add-medical-record', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        recordType,
        data,
        authorId
      })
    })
  }

  // Update inventory
  async updateInventory(items, updatedBy) {
    return this.request('/update-inventory', {
      method: 'POST',
      body: JSON.stringify({
        items,
        updatedBy
      })
    })
  }

  // Generate and download PDF report
  async generateReportPDF(reportType, transactions) {
    try {
      const response = await fetch(`${API_BASE}/generate-report-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          transactions
        })
      });

      if (!response.ok) {
        // Try to parse error from JSON, but fallback for other errors
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          // Response was not JSON, use status text
          errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Use a cleaner filename
      const fileName = `${reportType.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Report downloaded successfully' };
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  // Update patient discharge status
  async updatePatientDischargeStatus(patientId, dischargeStatus, approvedBy) {
    return this.request('/update-patient-discharge-status', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        dischargeStatus,
        approvedBy
      })
    })
  }

  // Create discharge notification
  async createDischargeNotification(notificationData) {
    return this.request('/create-discharge-notification', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }

  // Get discharge notifications
  async getDischargeNotifications() {
    return this.request('/get-discharge-notifications')
  }

  // Get accountant report data
  async getAccountantReport(payload) {
    return this.request('/get-accountant-report', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export default new ApiService()