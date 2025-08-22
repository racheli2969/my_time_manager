import { useState } from "react";
import { useTask } from "../contexts/TaskContext";
import { Calendar } from "lucide-react";

export const ScheduleView: React.FC = () => {
	const { scheduleEntries } = useTask();
	const [view, setView] = useState<'day' | 'week' | 'month'>('week');

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold text-gray-900">Schedule</h2>
					<p className="text-gray-600 mt-1">View and manage your task schedule</p>
				</div>
				<div className="flex items-center space-x-3">
					<div className="flex items-center border border-gray-300 rounded-lg">
						{['day', 'week', 'month'].map((v) => (
							<button
								key={v}
								onClick={() => setView(v as 'day' | 'week' | 'month')}
								className={`px-3 py-2 text-sm font-medium transition-colors ${
									view === v ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
								}`}
							>
								{v.charAt(0).toUpperCase() + v.slice(1)}
							</button>
						))}
					</div>
				</div>
			</div>
			<div className="bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="p-6">
					{(!scheduleEntries || scheduleEntries.length === 0) ? (
						<div className="text-center py-12">
							<Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Generated</h3>
							<p className="text-gray-600 mb-4">
								Generate a schedule to see your tasks organized by time.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{scheduleEntries.map((entry: any) => (
								<div key={entry.id} className="border-l-4 rounded-lg p-4 bg-gray-100">
									<div className="flex items-start justify-between">
										<div>
											<h4 className="font-medium text-gray-900">{entry.title}</h4>
											<div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
												<span>{entry.start?.toString()} - {entry.end?.toString()}</span>
											</div>
										</div>
										<span className="px-2 py-1 bg-white bg-opacity-70 rounded-full text-xs font-medium capitalize">
											{entry.priority}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
