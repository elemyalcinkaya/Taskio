/** Backend Task.TaskStatus enum names <-> UI labels used in screens */
const API_TO_UI = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    DONE: 'Done',
};

const UI_TO_API = {
    'To Do': 'TODO',
    'In Progress': 'IN_PROGRESS',
    Review: 'REVIEW',
    Done: 'DONE',
};

export function apiStatusToUi(apiStatus) {
    if (!apiStatus) return 'To Do';
    const key = String(apiStatus).trim();
    if (API_TO_UI[key]) return API_TO_UI[key];
    if (UI_TO_API[key] !== undefined) return key;
    return 'To Do';
}

export function uiStatusToApi(uiStatus) {
    if (!uiStatus) return 'TODO';
    const label = String(uiStatus).trim();
    if (UI_TO_API[label]) return UI_TO_API[label];
    if (API_TO_UI[label]) return label;
    return 'TODO';
}

export function normalizeTaskForUi(task) {
    if (!task) return task;
    return {
        ...task,
        status: apiStatusToUi(task.status),
    };
}
