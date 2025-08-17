"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nicNumber?: string;
  phoneNumber?: string | null;
  preferredLanguage?: string;
  loginMethod?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  address?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  gender?: string;
  citizenship?: string;
  maritalStatus?: string;
  occupation?: string;
  nationality?: string;
  [key: string]: any;
}

// Info row component
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-row justify-between items-center border-b border-gray-100 pb-2 last:border-b-0">
      <span className="font-medium text-gray-500">{label}:</span>
      <span className="text-gray-900 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

// Minimal, modern edit input with floating label
interface EditInputMinimalProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}
function EditInputMinimal({ label, name, value, onChange, type = "text" }: EditInputMinimalProps) {
  return (
    <div className="relative">
      <input
        className="peer w-full border-b-2 border-gray-200 bg-transparent px-0 py-3 text-base text-gray-900 focus:outline-none focus:border-blue-500 transition placeholder-transparent"
        name={name}
        id={name}
        value={value || ''}
        onChange={onChange}
        type={type}
        autoComplete="off"
        placeholder={label}
      />
      <label
        htmlFor={name}
        className="absolute left-0 top-3 text-gray-500 text-base pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 -z-1"
      >
        {label}
      </label>
    </div>
  );
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
      async function fetchProfile() {
        setLoading(true);
        setError("");
        try {
          console.log("Fetching profile...");
          const token = localStorage.getItem("accessToken");
          console.log('ProfilePage accessToken:', token);
          if (!token) {
            setError("Not authenticated. Please log in.");
            setLoading(false);
            return;
          }
          const res = await fetch("/api/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          console.log('ProfilePage API response:', data);
          if (!res.ok) throw new Error(data?.message || "Failed to fetch profile");
          setProfile(data?.data?.user || data?.user || data);
        } catch (err: any) {
          setError(err.message || "Failed to fetch profile");
        } finally {
          setLoading(false);
        }
      }
      fetchProfile();
    }, []);

    // Modal state for editing
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState<UserProfile | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    // Open edit modal with current profile data
    const openEdit = () => {
      setEditData({ ...profile });
      setEditError("");
      setEditOpen(true);
    };

    // Handle edit form changes
    const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Save profile changes (integrated with backend)
    const handleEditSave = async (e: FormEvent) => {
      e.preventDefault();
      setEditLoading(true);
      setEditError("");
      try {
        // Map camelCase to snake_case for backend
        const mapToSnake = (obj: UserProfile) => ({
          first_name: obj.firstName,
          last_name: obj.lastName,
          phone_number: obj.phoneNumber || obj.phone,
          address: obj.address,
          date_of_birth: obj.dateOfBirth,
          preferred_language: obj.preferredLanguage,
          profile_image_url: obj.profileImageUrl,
        });
        // Remove undefined/null fields from payload
        const rawPayload = mapToSnake(editData || {});
        const payload = Object.fromEntries(Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to update profile.");
        }
        setEditOpen(false);
        setEditLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } catch (err: any) {
        setEditError(err.message || "Failed to update profile.");
        setEditLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" style={{ fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "border-box" }}>
        <header className="w-full max-w-md px-4 pt-8 pb-4 mx-auto">
          <button onClick={() => router.back()} className="text-blue-600 font-semibold text-base mb-4 hover:underline">← Back</button>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8 tracking-tight">My Profile</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center w-full px-4">
          {loading ? (
            <div className="text-gray-400 text-center py-10">Loading profile...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : !profile ? (
            <div className="text-gray-400 text-center py-10">Profile not found.</div>
          ) : (
            <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col items-center relative">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 flex items-center justify-center mb-6 shadow-md">
                <span className="text-4xl font-bold text-white select-none">
                  {profile.firstName?.[0] || '?'}{profile.lastName?.[0] || ''}
                </span>
              </div>
              {/* Name and Email */}
              <div className="text-2xl font-semibold text-gray-900 mb-1 text-center">{profile.firstName} {profile.lastName}</div>
              <div className="text-gray-500 text-base mb-4 text-center">{profile.email}</div>
              {/* Info Table */}
              <div className="w-full grid grid-cols-1 gap-3 text-base text-gray-700 mb-6">
                <InfoRow label="NIC" value={profile.nicNumber || profile.nic || 'N/A'} />
                <InfoRow label="Phone" value={profile.phoneNumber || profile.phone || 'N/A'} />
                <InfoRow label="Date of Birth" value={profile.dateOfBirth ? profile.dateOfBirth.slice(0,10) : 'N/A'} />
                <InfoRow label="Address" value={profile.address || 'N/A'} />
                <InfoRow label="Role" value={profile.role || 'N/A'} />
                <InfoRow label="Status" value={profile.isActive ? 'Active' : 'Inactive'} />
                <InfoRow label="Created At" value={profile.createdAt ? profile.createdAt.slice(0,10) : 'N/A'} />
                {/* Add more fields as needed */}
                {profile.updatedAt && <InfoRow label="Last Updated" value={profile.updatedAt.slice(0,10)} />}
                {profile.gender && <InfoRow label="Gender" value={profile.gender} />}
                {profile.citizenship && <InfoRow label="Citizenship" value={profile.citizenship} />}
                {profile.maritalStatus && <InfoRow label="Marital Status" value={profile.maritalStatus} />}
                {profile.occupation && <InfoRow label="Occupation" value={profile.occupation} />}
                {profile.nationality && <InfoRow label="Nationality" value={profile.nationality} />}
              </div>

              <button onClick={openEdit} className="mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition">Edit Profile</button>
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  router.push("/auth/login");
                }}
                className="mt-4 px-6 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
              >
                Logout
              </button>

              {/* Edit Modal */}
              {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
                  <form
                    onSubmit={handleEditSave}
                    className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-sm relative flex flex-col overflow-hidden"
                    style={{
                      maxHeight: 'min(420px, calc(100dvh - 32px))',
                      marginBottom: 'env(safe-area-inset-bottom, 0px)',
                    }}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                      <h2 className="text-lg font-bold text-gray-900 tracking-tight">Edit Profile</h2>
                      <button type="button" onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
                    </div>
                    {/* Modal Body - minimal, modern, more whitespace */}
                    <div
                      className="px-6 pt-8 pb-2 flex-1 overflow-y-auto bg-white"
                      style={{
                        paddingBottom: '7.5rem',
                      }}
                    >
                      <div className="flex flex-col gap-6">
                        <EditInputMinimal label="First Name" name="firstName" value={editData?.firstName || ''} onChange={handleEditChange} />
                        <EditInputMinimal label="Last Name" name="lastName" value={editData?.lastName || ''} onChange={handleEditChange} />
                        <EditInputMinimal label="Email" name="email" value={editData?.email || ''} onChange={handleEditChange} type="email" />
                        <EditInputMinimal label="Phone" name="phoneNumber" value={editData?.phoneNumber || ''} onChange={handleEditChange} />
                        <EditInputMinimal label="Address" name="address" value={editData?.address || ''} onChange={handleEditChange} />
                        <EditInputMinimal label="Date of Birth" name="dateOfBirth" value={editData?.dateOfBirth ? editData.dateOfBirth.slice(0,10) : ''} onChange={handleEditChange} type="date" />
                        {/* Add more editable fields as needed */}
                      </div>
                      {editError && <div className="text-red-500 text-center mt-6">{editError}</div>}
                    </div>
                    {/* Modal Footer */}
                    <div
                      className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2"
                      style={{
                        position: 'relative',
                        width: '100%',
                        boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.04)',
                        background: 'rgba(249,250,251,0.98)',
                      }}
                    >
                      <button type="button" onClick={() => setEditOpen(false)} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition">Cancel</button>
                      <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2" disabled={editLoading}>
                        {editLoading && (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        )}
                        {editLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Info row component
