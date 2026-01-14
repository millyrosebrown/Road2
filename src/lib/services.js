// User/Authentication Service for ROAD2
import { account, databases, DATABASE_ID, COLLECTIONS, ID, Query } from './appwrite';

// ============================================
// AUTHENTICATION
// ============================================

export const authService = {
    // Create a new account
    async createAccount(email, password, name) {
        try {
            const user = await account.create(ID.unique(), email, password, name);
            // Auto login after signup
            await this.login(email, password);
            return user;
        } catch (error) {
            console.error('Create account error:', error);
            throw error;
        }
    },

    // Login
    async login(email, password) {
        try {
            return await account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout
    async logout() {
        try {
            return await account.deleteSession('current');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            return await account.get();
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    // Check if user is logged in
    async isLoggedIn() {
        try {
            const user = await this.getCurrentUser();
            return !!user;
        } catch {
            return false;
        }
    }
};

// ============================================
// USER PROFILE
// ============================================

export const userService = {
    // Create user profile
    async createProfile(userId, data) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId,
                {
                    name: data.name,
                    patientId: data.patientId || '',
                    ultimateGoal: data.ultimateGoal || '',
                    currentWeek: data.currentWeek || 1,
                    createdAt: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.error('Create profile error:', error);
            throw error;
        }
    },

    // Get user profile
    async getProfile(userId) {
        try {
            return await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId
            );
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    },

    // Update user profile
    async updateProfile(userId, data) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId,
                data
            );
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
};

// ============================================
// GOALS
// ============================================

export const goalsService = {
    // Create a goal
    async createGoal(userId, data) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.GOALS,
                ID.unique(),
                {
                    userId,
                    title: data.title,
                    completed: false,
                    date: data.date || new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.error('Create goal error:', error);
            throw error;
        }
    },

    // Get goals for a user and date
    async getGoals(userId, date = null) {
        try {
            const queries = [Query.equal('userId', userId)];
            if (date) {
                queries.push(Query.equal('date', date));
            }
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.GOALS,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('Get goals error:', error);
            return [];
        }
    },

    // Toggle goal completion
    async toggleGoal(goalId, completed) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.GOALS,
                goalId,
                { completed }
            );
        } catch (error) {
            console.error('Toggle goal error:', error);
            throw error;
        }
    },

    // Delete a goal
    async deleteGoal(goalId) {
        try {
            return await databases.deleteDocument(
                DATABASE_ID,
                COLLECTIONS.GOALS,
                goalId
            );
        } catch (error) {
            console.error('Delete goal error:', error);
            throw error;
        }
    }
};

// ============================================
// EXERCISES / FITNESS DIARY
// ============================================

export const exerciseService = {
    // Log an exercise
    async logExercise(userId, data) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.EXERCISES,
                ID.unique(),
                {
                    userId,
                    name: data.name,
                    sets: data.sets || 0,
                    reps: data.reps || 0,
                    duration: data.duration || 0,
                    date: data.date || new Date().toISOString().split('T')[0],
                    completed: data.completed || false,
                    notes: data.notes || '',
                    createdAt: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.error('Log exercise error:', error);
            throw error;
        }
    },

    // Get exercises for a date
    async getExercises(userId, date) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.EXERCISES,
                [
                    Query.equal('userId', userId),
                    Query.equal('date', date)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Get exercises error:', error);
            return [];
        }
    },

    // Get exercises for a week
    async getWeekExercises(userId, startDate, endDate) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.EXERCISES,
                [
                    Query.equal('userId', userId),
                    Query.greaterThanEqual('date', startDate),
                    Query.lessThanEqual('date', endDate)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Get week exercises error:', error);
            return [];
        }
    },

    // Mark exercise as complete
    async completeExercise(exerciseId) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.EXERCISES,
                exerciseId,
                { completed: true }
            );
        } catch (error) {
            console.error('Complete exercise error:', error);
            throw error;
        }
    }
};

// ============================================
// JOURNEY PROGRESS
// ============================================

export const journeyService = {
    // Save journey progress
    async saveProgress(userId, data) {
        try {
            // Check if journey exists
            const existing = await this.getProgress(userId);

            if (existing) {
                return await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.JOURNEYS,
                    existing.$id,
                    {
                        ultimateGoal: data.ultimateGoal,
                        currentWeek: data.currentWeek,
                        completedWeeks: data.completedWeeks || [],
                        updatedAt: new Date().toISOString(),
                    }
                );
            } else {
                return await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.JOURNEYS,
                    ID.unique(),
                    {
                        userId,
                        ultimateGoal: data.ultimateGoal,
                        currentWeek: data.currentWeek || 1,
                        completedWeeks: data.completedWeeks || [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                );
            }
        } catch (error) {
            console.error('Save progress error:', error);
            throw error;
        }
    },

    // Get journey progress
    async getProgress(userId) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.JOURNEYS,
                [Query.equal('userId', userId)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Get progress error:', error);
            return null;
        }
    },

    // Complete a week
    async completeWeek(userId, weekNumber) {
        try {
            const progress = await this.getProgress(userId);
            if (progress) {
                const completedWeeks = [...(progress.completedWeeks || []), weekNumber];
                return await this.saveProgress(userId, {
                    ...progress,
                    completedWeeks,
                    currentWeek: weekNumber + 1
                });
            }
        } catch (error) {
            console.error('Complete week error:', error);
            throw error;
        }
    }
};
