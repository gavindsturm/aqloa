'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Users,
  Phone,
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  DollarSign,
  Clock,
  Activity,
  UserPlus,
  PhoneCall,
  Mail,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  LogOut
} from 'lucide-react'

type Tab = 'overview' | 'leads' | 'calls' | 'appointments' | 'team' | 'analytics'

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeadFilter, setSelectedLeadFilter] = useState('all')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('isAuthenticated')
      const email = localStorage.getItem('userEmail') || 'user@example.com'
      
      if (!isAuth) {
        router.push('/login')
      } else {
        setUserEmail(email)
      }
    }
  }, [router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userEmail')
    }
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Searching for: ${searchQuery}`)
  }

  const handleNewLead = () => {
    alert('Opening new lead form...')
  }

  const handleCall = (name: string) => {
    alert(`Initiating call to ${name}...`)
  }

  const handleEmail = (name: string) => {
    alert(`Opening email composer for ${name}...`)
  }

  const handleEdit = (name: string) => {
    alert(`Editing ${name}...`)
  }

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      alert(`${name} deleted`)
    }
  }

  const handleExport = () => {
    alert('Exporting data to CSV...')
  }

  const handleAssignLead = (leadName: string) => {
    alert(`Opening assignment dialog for ${leadName}...`)
  }

  const handleStartMeeting = (client: string) => {
    alert(`Starting meeting with ${client}...`)
  }

  const handleReschedule = (client: string) => {
    alert(`Opening reschedule dialog for ${client}...`)
  }

  const handleSendReminder = (client: string) => {
    alert(`Sending reminder to ${client}...`)
  }

  const handleNotifications = () => {
    alert('Opening notifications panel...')
  }

  const handleSettings = () => {
    alert('Opening settings...')
  }

  // Mock data
  const teamMembers = [
    { id: 1, name: 'Sarah Martinez', email: 'sarah@agency.com', role: 'Senior Agent', leads: 145, calls: 234, appointments: 32, closed: 18, revenue: 45600 },
    { id: 2, name: 'Mike Thompson', email: 'mike@agency.com', role: 'Sales Agent', leads: 132, calls: 198, appointments: 28, closed: 15, revenue: 38200 },
    { id: 3, name: 'Jennifer Park', email: 'jennifer@agency.com', role: 'Senior Agent', leads: 128, calls: 187, appointments: 26, closed: 14, revenue: 36800 },
    { id: 4, name: 'David Chen', email: 'david@agency.com', role: 'Sales Agent', leads: 118, calls: 165, appointments: 24, closed: 12, revenue: 32400 },
    { id: 5, name: 'Emily Rodriguez', email: 'emily@agency.com', role: 'Sales Agent', leads: 112, calls: 156, appointments: 22, closed: 11, revenue: 29800 },
    { id: 6, name: 'James Wilson', email: 'james@agency.com', role: 'Junior Agent', leads: 95, calls: 142, appointments: 18, closed: 9, revenue: 24200 },
    { id: 7, name: 'Lisa Anderson', email: 'lisa@agency.com', role: 'Sales Agent', leads: 108, calls: 148, appointments: 20, closed: 10, revenue: 27500 },
    { id: 8, name: 'Robert Taylor', email: 'robert@agency.com', role: 'Junior Agent', leads: 88, calls: 128, appointments: 16, closed: 8, revenue: 21600 },
  ]

  const recentLeads = [
    { id: 1, name: 'John Patterson', phone: '(555) 123-4567', email: 'john.p@email.com', source: 'Facebook Ads', status: 'new', value: '$2,400', assignedTo: 'Sarah Martinez', time: '5 min ago' },
    { id: 2, name: 'Maria Garcia', phone: '(555) 234-5678', email: 'maria.g@email.com', source: 'Google Ads', status: 'contacted', value: '$3,200', assignedTo: 'Mike Thompson', time: '12 min ago' },
    { id: 3, name: 'Thomas Lee', phone: '(555) 345-6789', email: 'thomas.l@email.com', source: 'Referral', status: 'qualified', value: '$4,800', assignedTo: 'Jennifer Park', time: '1 hour ago' },
    { id: 4, name: 'Amanda White', phone: '(555) 456-7890', email: 'amanda.w@email.com', source: 'LinkedIn', status: 'new', value: '$2,800', assignedTo: 'David Chen', time: '2 hours ago' },
    { id: 5, name: 'Carlos Martinez', phone: '(555) 567-8901', email: 'carlos.m@email.com', source: 'Facebook Ads', status: 'contacted', value: '$3,600', assignedTo: 'Emily Rodriguez', time: '3 hours ago' },
    { id: 6, name: 'Rachel Kim', phone: '(555) 678-9012', email: 'rachel.k@email.com', source: 'Website', status: 'qualified', value: '$5,200', assignedTo: 'Sarah Martinez', time: '4 hours ago' },
  ]

  const todayAppointments = [
    { id: 1, client: 'John Patterson', time: '9:00 AM', agent: 'Sarah Martinez', type: 'Initial Consultation', status: 'confirmed', phone: '(555) 123-4567' },
    { id: 2, client: 'Maria Garcia', time: '10:30 AM', agent: 'Mike Thompson', type: 'Policy Review', status: 'confirmed', phone: '(555) 234-5678' },
    { id: 3, client: 'Thomas Lee', time: '1:00 PM', agent: 'Jennifer Park', type: 'Final Application', status: 'pending', phone: '(555) 345-6789' },
    { id: 4, client: 'Rachel Kim', time: '2:30 PM', agent: 'Sarah Martinez', type: 'Needs Analysis', status: 'confirmed', phone: '(555) 678-9012' },
    { id: 5, client: 'David Smith', time: '4:00 PM', agent: 'David Chen', type: 'Follow-up Call', status: 'pending', phone: '(555) 789-0123' },
  ]

  const recentCalls = [
    { id: 1, contact: 'John Patterson', duration: '12:34', outcome: 'Appointment Set', agent: 'Sarah Martinez', time: '10 min ago', sentiment: 'positive' },
    { id: 2, contact: 'Maria Garcia', duration: '8:45', outcome: 'Information Sent', agent: 'Mike Thompson', time: '25 min ago', sentiment: 'neutral' },
    { id: 3, contact: 'Thomas Lee', duration: '15:22', outcome: 'Application Started', agent: 'Jennifer Park', time: '1 hour ago', sentiment: 'positive' },
    { id: 4, contact: 'Amanda White', duration: '6:12', outcome: 'Voicemail', agent: 'David Chen', time: '2 hours ago', sentiment: 'neutral' },
    { id: 5, contact: 'Carlos Martinez', duration: '11:30', outcome: 'Follow-up Scheduled', agent: 'Emily Rodriguez', time: '3 hours ago', sentiment: 'positive' },
  ]

  const navigation = [
    { name: 'Overview', icon: Home, tab: 'overview' as Tab },
    { name: 'Leads', icon: Users, tab: 'leads' as Tab },
    { name: 'Calls', icon: Phone, tab: 'calls' as Tab },
    { name: 'Appointments', icon: Calendar, tab: 'appointments' as Tab },
    { name: 'Team', icon: TrendingUp, tab: 'team' as Tab },
    { name: 'Analytics', icon: BarChart3, tab: 'analytics' as Tab },
  ]

  const filteredLeads = selectedLeadFilter === 'all' 
    ? recentLeads 
    : recentLeads.filter(lead => lead.status === selectedLeadFilter)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-neutral-200 fixed top-0 w-full z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-neutral-100 mr-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-2xl font-bold text-neutral-900">Aqloa</span>
            </div>

            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads, contacts..."
                  className="pl-10 pr-4 py-2 border-2 border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-400 focus:border-transparent w-64"
                />
              </form>

              <button 
                onClick={handleNotifications}
                className="relative p-2 rounded-md hover:bg-neutral-100"
              >
                <Bell className="w-6 h-6 text-neutral-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button 
                onClick={handleSettings}
                className="p-2 rounded-md hover:bg-neutral-100"
              >
                <Settings className="w-6 h-6 text-neutral-600" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 pl-4 border-l border-neutral-200"
                >
                  <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-neutral-900">{userEmail}</div>
                    <div className="text-xs text-neutral-500">Account Owner</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-md shadow-lg py-1">
                    <button 
                      onClick={() => { alert('Opening profile...'); setShowUserMenu(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => { alert('Opening billing...'); setShowUserMenu(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Billing
                    </button>
                    <hr className="my-1 border-neutral-200" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} mt-16 lg:mt-0`}>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Navigation</h3>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-all ${
                      activeTab === item.tab
                        ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={handleNewLead} className="btn-primary w-full text-sm py-2 flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  New Lead
                </button>
                <button onClick={() => alert('Starting call...')} className="btn-secondary w-full text-sm py-2 flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Start Call
                </button>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-600">Today's Goal</span>
                <span className="text-xs font-bold text-green-600">80%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-neutral-600">24 / 30 calls completed</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Dashboard Overview</h1>
                  <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <button onClick={handleNewLead} className="btn-primary flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  New Lead
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-600">New Leads</span>
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">142</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-semibold">+12%</span>
                    <span className="text-neutral-500 ml-2">vs last week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-600">Appointments</span>
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">28</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-semibold">+8%</span>
                    <span className="text-neutral-500 ml-2">vs last week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-600">Active Calls</span>
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">387</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-semibold">+18%</span>
                    <span className="text-neutral-500 ml-2">vs last week</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-600">Revenue</span>
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 mb-1">$256K</div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-600 font-semibold">+24%</span>
                    <span className="text-neutral-500 ml-2">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-2 card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900">Recent Leads</h2>
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className="text-sm text-neutral-600 hover:text-neutral-900 font-semibold"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentLeads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{lead.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{lead.name}</div>
                            <div className="text-sm text-neutral-600">{lead.source} • {lead.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-neutral-900">{lead.value}</div>
                            <div className="text-sm text-neutral-600">{lead.assignedTo}</div>
                          </div>
                          <span className={`badge ${
                            lead.status === 'new' ? 'badge-new' :
                            lead.status === 'contacted' ? 'badge-contacted' :
                            'badge-qualified'
                          }`}>
                            {lead.status}
                          </span>
                          <div className="flex space-x-1">
                            <button onClick={() => handleCall(lead.name)} className="p-2 hover:bg-neutral-200 rounded-md" title="Call">
                              <Phone className="w-4 h-4 text-neutral-600" />
                            </button>
                            <button onClick={() => handleEmail(lead.name)} className="p-2 hover:bg-neutral-200 rounded-md" title="Email">
                              <Mail className="w-4 h-4 text-neutral-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Appointments */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900">Today's Schedule</h2>
                    <Calendar className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="space-y-3">
                    {todayAppointments.slice(0, 4).map((apt) => (
                      <div key={apt.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-neutral-900 text-sm">{apt.time}</span>
                          <span className={`badge ${apt.status === 'confirmed' ? 'badge-qualified' : 'badge-contacted'}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-neutral-900">{apt.client}</div>
                        <div className="text-xs text-neutral-600 mt-1">{apt.type}</div>
                        <button 
                          onClick={() => handleStartMeeting(apt.client)}
                          className="mt-2 text-xs btn-primary w-full py-1"
                        >
                          Join Meeting
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Performance */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">Team Leaderboard</h2>
                  <button 
                    onClick={() => setActiveTab('team')}
                    className="text-sm text-neutral-600 hover:text-neutral-900 font-semibold"
                  >
                    View Full Team
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {teamMembers.slice(0, 3).map((member, index) => (
                    <div key={member.id} className="p-4 bg-neutral-50 rounded-lg border-2 border-neutral-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{member.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{member.name}</div>
                          <div className="text-xs text-neutral-600">{member.role}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-neutral-600 text-xs">Closed</div>
                          <div className="font-bold text-green-600">{member.closed}</div>
                        </div>
                        <div>
                          <div className="text-neutral-600 text-xs">Revenue</div>
                          <div className="font-bold text-neutral-900">${(member.revenue / 1000).toFixed(1)}k</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Lead Management</h1>
                  <p className="text-neutral-600 mt-1">Manage and track all your leads</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleExport} className="btn-secondary flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Export
                  </button>
                  <button onClick={handleNewLead} className="btn-primary flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    New Lead
                  </button>
                </div>
              </div>

              {/* Lead Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Total Leads</div>
                  <div className="text-2xl font-bold text-neutral-900">826</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">New Today</div>
                  <div className="text-2xl font-bold text-blue-600">42</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Qualified</div>
                  <div className="text-2xl font-bold text-green-600">124</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Conversion Rate</div>
                  <div className="text-2xl font-bold text-neutral-900">18.5%</div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="card">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedLeadFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-semibold ${selectedLeadFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 border-2 border-neutral-300'}`}
                    >
                      All Leads
                    </button>
                    <button 
                      onClick={() => setSelectedLeadFilter('new')}
                      className={`px-4 py-2 rounded-md text-sm font-semibold ${selectedLeadFilter === 'new' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 border-2 border-neutral-300'}`}
                    >
                      New
                    </button>
                    <button 
                      onClick={() => setSelectedLeadFilter('contacted')}
                      className={`px-4 py-2 rounded-md text-sm font-semibold ${selectedLeadFilter === 'contacted' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 border-2 border-neutral-300'}`}
                    >
                      Contacted
                    </button>
                    <button 
                      onClick={() => setSelectedLeadFilter('qualified')}
                      className={`px-4 py-2 rounded-md text-sm font-semibold ${selectedLeadFilter === 'qualified' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 border-2 border-neutral-300'}`}
                    >
                      Qualified
                    </button>
                  </div>
                  <button onClick={() => alert('Opening filter options...')} className="btn-ghost flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Source</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Value</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Assigned To</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-neutral-900">{lead.name}</div>
                            <div className="text-sm text-neutral-600">{lead.phone}</div>
                          </td>
                          <td className="py-4 px-4 text-sm text-neutral-700">{lead.source}</td>
                          <td className="py-4 px-4">
                            <span className={`badge ${
                              lead.status === 'new' ? 'badge-new' :
                              lead.status === 'contacted' ? 'badge-contacted' :
                              'badge-qualified'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-neutral-900">{lead.value}</td>
                          <td className="py-4 px-4 text-sm text-neutral-700">{lead.assignedTo}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-1">
                              <button onClick={() => handleCall(lead.name)} className="p-2 hover:bg-neutral-100 rounded-md" title="Call">
                                <Phone className="w-4 h-4 text-neutral-600" />
                              </button>
                              <button onClick={() => handleEmail(lead.name)} className="p-2 hover:bg-neutral-100 rounded-md" title="Email">
                                <Mail className="w-4 h-4 text-neutral-600" />
                              </button>
                              <button onClick={() => handleEdit(lead.name)} className="p-2 hover:bg-neutral-100 rounded-md" title="Edit">
                                <Edit className="w-4 h-4 text-neutral-600" />
                              </button>
                              <button onClick={() => handleDelete(lead.name)} className="p-2 hover:bg-neutral-100 rounded-md" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Call Activity</h1>
                  <p className="text-neutral-600 mt-1">Track and analyze all your calls</p>
                </div>
                <button onClick={() => alert('Initiating new call...')} className="btn-primary flex items-center">
                  <PhoneCall className="w-5 h-5 mr-2" />
                  Make Call
                </button>
              </div>

              {/* Call Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Total Calls Today</div>
                  <div className="text-2xl font-bold text-neutral-900">387</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Avg. Duration</div>
                  <div className="text-2xl font-bold text-blue-600">10:45</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Connected Rate</div>
                  <div className="text-2xl font-bold text-green-600">68%</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Appointments Set</div>
                  <div className="text-2xl font-bold text-neutral-900">28</div>
                </div>
              </div>

              {/* Call Log */}
              <div className="card">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Calls</h2>
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            call.sentiment === 'positive' ? 'bg-green-100' : 'bg-neutral-100'
                          }`}>
                            <Phone className={`w-5 h-5 ${call.sentiment === 'positive' ? 'text-green-600' : 'text-neutral-600'}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900">{call.contact}</div>
                            <div className="text-sm text-neutral-600">{call.agent} • {call.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-neutral-900">{call.duration}</div>
                            <div className="text-sm text-neutral-600">{call.outcome}</div>
                          </div>
                          <button onClick={() => alert(`Viewing call details for ${call.contact}...`)} className="p-2 hover:bg-neutral-100 rounded-md">
                            <Activity className="w-5 h-5 text-neutral-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Appointments</h1>
                  <p className="text-neutral-600 mt-1">Manage your schedule</p>
                </div>
                <button onClick={() => alert('Opening appointment booking form...')} className="btn-primary flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Book Appointment
                </button>
              </div>

              {/* Appointment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Today</div>
                  <div className="text-2xl font-bold text-neutral-900">5</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">This Week</div>
                  <div className="text-2xl font-bold text-blue-600">28</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Show Rate</div>
                  <div className="text-2xl font-bold text-green-600">87%</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Avg. Value</div>
                  <div className="text-2xl font-bold text-neutral-900">$3.2K</div>
                </div>
              </div>

              {/* Appointments List */}
              <div className="card">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Today's Appointments</h2>
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="p-5 bg-neutral-50 rounded-lg border-2 border-neutral-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 text-lg">{apt.time}</div>
                            <div className="text-sm text-neutral-600">{apt.type}</div>
                          </div>
                        </div>
                        <span className={`badge ${apt.status === 'confirmed' ? 'badge-qualified' : 'badge-contacted'}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pl-16 mb-4">
                        <div>
                          <div className="font-semibold text-neutral-900">{apt.client}</div>
                          <div className="text-sm text-neutral-600">{apt.phone}</div>
                        </div>
                        <div className="text-sm text-neutral-600">with {apt.agent}</div>
                      </div>
                      <div className="flex space-x-2 pl-16">
                        <button onClick={() => handleStartMeeting(apt.client)} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700">
                          Start Meeting
                        </button>
                        <button onClick={() => handleReschedule(apt.client)} className="btn-secondary text-sm py-2">
                          Reschedule
                        </button>
                        <button onClick={() => handleSendReminder(apt.client)} className="btn-ghost text-sm py-2">
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Team Performance</h1>
                  <p className="text-neutral-600 mt-1">Track your team's activity</p>
                </div>
                <button onClick={() => alert('Opening add team member form...')} className="btn-primary flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Member
                </button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Team Members</div>
                  <div className="text-2xl font-bold text-neutral-900">8</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-600">$256K</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Avg. Close Rate</div>
                  <div className="text-2xl font-bold text-blue-600">13.2%</div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-neutral-600 mb-1">Active Deals</div>
                  <div className="text-2xl font-bold text-neutral-900">87</div>
                </div>
              </div>

              {/* Team Leaderboard */}
              <div className="card">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Performance Leaderboard</h2>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={member.id} className={`p-5 rounded-lg border-2 ${
                      index < 3 ? 'bg-neutral-50 border-neutral-900' : 'bg-white border-neutral-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-neutral-400">#{index + 1}</div>
                          <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{member.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 text-lg">{member.name}</div>
                            <div className="text-sm text-neutral-600">{member.role}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <div className="text-sm text-neutral-600">Leads</div>
                            <div className="text-xl font-bold text-neutral-900">{member.leads}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-600">Calls</div>
                            <div className="text-xl font-bold text-blue-600">{member.calls}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-600">Closed</div>
                            <div className="text-xl font-bold text-green-600">{member.closed}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-600">Revenue</div>
                            <div className="text-xl font-bold text-neutral-900">${(member.revenue / 1000).toFixed(0)}K</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Analytics & Insights</h1>
                  <p className="text-neutral-600 mt-1">Performance metrics and trends</p>
                </div>
                <button onClick={handleExport} className="btn-secondary flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Report
                </button>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900">Conversion Funnel</h3>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Leads</span>
                        <span className="font-bold">826</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Contacted</span>
                        <span className="font-bold">542 (65.6%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65.6%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Qualified</span>
                        <span className="font-bold">234 (28.3%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '28.3%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-600">Closed</span>
                        <span className="font-bold">109 (13.2%)</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '13.2%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900">Lead Source ROI</h3>
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="space-y-3">
                    {[
                      { source: 'Facebook Ads', cost: '$8,200', revenue: '$48,600', roi: '493%' },
                      { source: 'Google Ads', cost: '$6,500', revenue: '$38,200', roi: '488%' },
                      { source: 'Referrals', cost: '$1,200', revenue: '$28,400', roi: '2267%' },
                      { source: 'LinkedIn', cost: '$4,800', revenue: '$22,600', roi: '371%' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-neutral-900 text-sm">{item.source}</span>
                          <span className="text-green-600 font-bold text-sm">{item.roi}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-600">
                          <span>Cost: {item.cost}</span>
                          <span>Revenue: {item.revenue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900">Activity Overview</h3>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600">Calls Made</span>
                        <span className="font-bold text-neutral-900">387</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600">Emails Sent</span>
                        <span className="font-bold text-neutral-900">542</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600">Meetings Held</span>
                        <span className="font-bold text-neutral-900">28</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600">Proposals Sent</span>
                        <span className="font-bold text-neutral-900">45</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-neutral-900">87%</div>
                        <div className="text-sm text-neutral-600">Goal Completion</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Performance Chart */}
              <div className="card">
                <h3 className="font-bold text-neutral-900 mb-4">Monthly Performance Trend</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[65, 72, 58, 85, 78, 92, 88, 95, 82, 98, 105, 112].map((value, i) => (
                    <div key={i} className="flex-1 bg-neutral-900 rounded-t-md relative group cursor-pointer hover:bg-neutral-700 transition-all" style={{ height: `${value}%` }}>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value} deals
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-neutral-600">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                    <span key={i}>{month}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
