


// Fetch stakeholders
async function fetchStakeholders() {
    try {
        const response = await fetch(`${API_BASE_URL}/stakeholders/project/${projectId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            handleAuthError();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch stakeholders');
        }
        
        stakeholders = await response.json();
        renderStakeholdersTable();
        return stakeholders;
    } catch (error) {
        console.error('Error fetching stakeholders:', error);
        stakeholders = [];
        renderStakeholdersTable();
        return [];
    }
}

// Render stakeholders table
function renderStakeholdersTable() {
    const stakeholdersTableBody = document.getElementById('stakeholdersTableBody'); // Get the table body element

    if (!stakeholdersTableBody) {
        console.error('Stakeholders table body element not found');
        return;
    }

    stakeholdersTableBody.innerHTML = '';

    if (stakeholders.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" class="empty-table">No stakeholders found. Click "Add Stakeholder" to add one.</td>`;
        stakeholdersTableBody.appendChild(emptyRow);
        return;
    }

    stakeholders.forEach(stakeholder => {
        const row = document.createElement('tr');
        const influenceBadge = getInfluenceBadge(stakeholder.influence);
        
        row.innerHTML = `
            <td>${projectId}</td>
            <td>${stakeholder.name}</td>
            <td>${stakeholder.role}</td>
            <td>${stakeholder.contact}</td>
            <td>${influenceBadge}</td>
            <td class="actions">
                <button type="button" class="edit-stakeholder-btn" data-id="${stakeholder.id}" ${isApproved ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button type="button" class="delete-stakeholder-btn" data-id="${stakeholder.id}" ${isApproved ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        
        stakeholdersTableBody.appendChild(row);
    });

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-stakeholder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const stakeholderId = e.currentTarget.getAttribute('data-id');
            editStakeholder(stakeholderId);
        });
    });

    document.querySelectorAll('.delete-stakeholder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const stakeholderId = e.currentTarget.getAttribute('data-id');
            deleteStakeholder(stakeholderId);
        });
    });
}

// Get HTML for influence badge
function getInfluenceBadge(influence) {
    const influenceMap = {
        'high': { label: 'High', class: 'badge-high' },
        'medium': { label: 'Medium', class: 'badge-medium' },
        'low': { label: 'Low', class: 'badge-low' }
    };

    const influenceInfo = influenceMap[influence.toLowerCase()] || { label: influence, class: 'badge-medium' };
    return `<span class="badge ${influenceInfo.class}">${influenceInfo.label}</span>`;
}

// Placeholder functions for edit and delete stakeholder actions
function editStakeholder(stakeholderId) {
    console.log(`Editing stakeholder with ID: ${stakeholderId}`);
    // Implement your edit stakeholder logic here
}

function deleteStakeholder(stakeholderId) {
    console.log(`Deleting stakeholder with ID: ${stakeholderId}`);
    // Implement your delete stakeholder logic here
}